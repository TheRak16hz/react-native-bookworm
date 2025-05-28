import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import AutoIncrement from 'mongoose-sequence';
import { pbkdf2 } from 'crypto';
import { promisify } from 'util';
import crypto from 'crypto';

const pbkdf2Async = promisify(pbkdf2);

const accounts_customuser = new mongoose.Schema({
    id: { type: Number }, // Nuevo campo id
    password: {
        type: String,
        required: true,
        minlenghth: 6
    },
    last_login: {
        type: Date,
    default: Date.now
    },
    cedula: {
        type: String,
        required: true,
        unique: true
    },
    email: {
        type:
        String,
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
}, { collection: 'accounts_customuser' }); // Especificamos el nombre de la colección aquí

// Inicializa el plugin mongoose-sequence para el modelo User y el campo ID
const AutoIncrementFactory = AutoIncrement(mongoose);
accounts_customuser.plugin(AutoIncrementFactory, { id: 'userIdCounter', inc_field: 'id', start_seq: 1 });

//hash de password before saving to database
accounts_customuser.pre("save", async function (next) {
    if (!this.isModified("password")) {
        return next();
    }

    const salt = crypto.randomBytes(16).toString('hex');
    const iterations = 390000;
    const keylen = 32;
    const digest = 'sha256';

    try {
        const derivedKey = await pbkdf2Async(this.password, salt, iterations, keylen, digest);
        const hash = derivedKey.toString('base64');
        this.password = `pbkdf2_${digest}$${iterations}$${salt}$${hash}`;
        next();
    } catch (error) {
        console.error('Error al generar el hash con PBKDF2:', error);
        next(error);
    }
});


//compare user password for login passing to pbkdf2
accounts_customuser.methods.comparePassword = async function (userPassword) {
    if (!this.password.startsWith('pbkdf2_')) {
        return await bcrypt.compare(userPassword, this.password);
    }

    const parts = this.password.split('$');
    console.log('Partes del hash:', parts);

    if (parts.length !== 4) {
        console.error('Formato de hash PBKDF2 inválido:', this.password);
        return false;
    }

    const fullAlgorithm = parts[0].substring(7); // Intentamos extraer 'sha256' de 'pbkdf2_sha256'
    let algorithmDigest = fullAlgorithm;

    if (fullAlgorithm.startsWith('_')) {
        algorithmDigest = fullAlgorithm.substring(1); // Si hay un '_' extra
    }

    const iterations = parseInt(parts[1], 10);
    const salt = parts[2];
    const storedHashBase64 = parts[3];
    const keylen = 32;

    console.log('Algoritmo Digest:', algorithmDigest);
    console.log('Iteraciones:', iterations);
    console.log('Sal:', salt);
    console.log('Hash Almacenado:', storedHashBase64);

    try {
        const derivedKey = await pbkdf2Async(userPassword, salt, iterations, keylen, algorithmDigest);
        const hashToCompare = derivedKey.toString('base64');
        const match = hashToCompare === storedHashBase64;
        console.log('Resultado de la comparación:', match);
        return match;
    } catch (error) {
        console.error('Error al comparar la contraseña con PBKDF2:', error);
        return false;
    }
};


const User = mongoose.model("accounts_customuser", accounts_customuser);

export default User;