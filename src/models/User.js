import mongoose from 'mongoose';

import AutoIncrement from 'mongoose-sequence';
import { pbkdf2 } from 'crypto';
import { promisify } from 'util';
import crypto from 'crypto';

const pbkdf2Async = promisify(pbkdf2);

// Definición del esquema de usuario
const accounts_customuser = new mongoose.Schema({
    id: { type: Number, unique: true }, // Aseguramos que 'id' autoincremental también sea único
    password: {
        type: String,
        required: true,
        minlength: 6 // <-- CORREGIDO: "minlenghth" a "minlength"
    },
    last_login: {
        type: Date,
        default: Date.now
    },
    cedula: {
        type: String,
        required: true,
        unique: true,
        minlength: 8 // Agregado aquí para consistencia con tu validación en authRoutes
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    is_active: {
        type: Boolean,
        default: true
    },
    is_admin: {
        type: Boolean,
        default: false
    },
    profileImage: {
        type: String,
        default: ""
    }
}, {
    collection: 'accounts_customuser', // Nombre de la colección
    timestamps: true // Añade createdAt y updatedAt automáticamente, útil para last_login
});

// Inicializa el plugin mongoose-sequence para el campo 'id'
const AutoIncrementFactory = AutoIncrement(mongoose);
accounts_customuser.plugin(AutoIncrementFactory, { id: 'userIdCounter', inc_field: 'id', start_seq: 1 });

// === HOOK PRE-SAVE PARA HASHEAR LA CONTRASEÑA CON PBKDF2 ===
accounts_customuser.pre("save", async function (next) {
    // Solo hashea si la contraseña ha sido modificada (o es nueva)
    if (!this.isModified("password")) {
        return next();
    }

    // Parámetros PBKDF2 (ajustados para ser más robustos)
    const salt = crypto.randomBytes(16).toString('hex'); // Sal aleatoria
    const iterations = 390000; // Iteraciones (un valor alto es bueno)
    const keylen = 32;          // Longitud de la clave derivada en bytes
    const digest = 'sha256';    // Algoritmo de hash (ej. sha256)

    try {
        // Generar el hash de la contraseña
        const derivedKey = await pbkdf2Async(this.password, salt, iterations, keylen, digest);
        const hash = derivedKey.toString('base64');

        // Almacenar la contraseña en el formato: "pbkdf2_<digest>$<iterations>$<salt>$<hash_base64>"
        this.password = `pbkdf2_${digest}$${iterations}$${salt}$${hash}`;
        next();
    } catch (error) {
        console.error('Error al hashear la contraseña con PBKDF2:', error);
        next(error); // Pasa el error a Mongoose
    }
});


// === MÉTODO PARA COMPARAR LA CONTRASEÑA EN EL LOGIN CON PBKDF2 ===
accounts_customuser.methods.comparePassword = async function (candidatePassword) {
    if (!this.password.startsWith('pbkdf2_')) {
        console.warn("User.comparePassword: La contraseña almacenada no tiene formato PBKDF2.");
        return false; // Si solo quieres PBKDF2, cualquier otro formato es inválido.
    }

    const parts = this.password.split('$');
    // console.log('Partes del hash PBKDF2:', parts); // Para depuración

    // Validar el formato del hash almacenado
    if (parts.length !== 4) {
        console.error('User.comparePassword: Formato de hash PBKDF2 inválido en la DB:', this.password);
        return false;
    }

    const fullAlgorithm = parts[0]; // ej. "pbkdf2_sha256"
    const digest = fullAlgorithm.substring(fullAlgorithm.indexOf('_') + 1); // Extraer "sha256"
    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const storedHashBase64 = parts[3];
    const keylen = 32; // Debe coincidir con la longitud usada para hashear


    try {
        // Generar el hash de la contraseña candidata con los mismos parámetros
        const derivedKey = await pbkdf2Async(candidatePassword, salt, iterations, keylen, digest);
        const hashToCompare = derivedKey.toString('base64');

        // Comparar el hash generado con el hash almacenado
        const match = hashToCompare === storedHashBase64;
        // console.log('Resultado de la comparación de PBKDF2:', match); // Para depuración
        return match;
    } catch (error) {
        console.error('Error al comparar la contraseña con PBKDF2:', error);
        return false;
    }
};


// Exportar el modelo
const User = mongoose.model("accounts_customuser", accounts_customuser);

export default User;