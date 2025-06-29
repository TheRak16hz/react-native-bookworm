import mongoose from 'mongoose';
import { pbkdf2 } from 'crypto';
import { promisify } from 'util';
import crypto from 'crypto';

const pbkdf2Async = promisify(pbkdf2);

const staff = new mongoose.Schema({
  id: { type: Number, unique: true },
  cedula: { type: String, required: true, unique: true },
  nombre: { type: String, required: true },
  apellido: { type: String, required: true },
  correo: { type: String, required: true, unique: true },
  password: { type: String, required: true, minlength: 6 },
  role: { type: String, required: true, enum: ['admin', 'profesor'] },
  status: { type: Boolean, default: true }
}, {
  collection: 'staff',
  timestamps: true
});

// Hook para hashear password
staff.pre("save", async function(next) {
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
    console.error("Error al hashear la contraseña del staff:", error);
    next(error);
  }
});

// Método para comparar contraseñas
staff.methods.comparePassword = async function(candidatePassword) {
  if (!this.password.startsWith('pbkdf2_')) {
    console.warn("Staff.comparePassword: El formato de contraseña es inválido.");
    return false;
  }

  const parts = this.password.split('$');
  if (parts.length !== 4) {
    console.error("Staff.comparePassword: Formato de hash PBKDF2 inválido:", this.password);
    return false;
  }

  const digest = parts[0].substring(parts[0].indexOf('_') + 1);
  const iterations = parseInt(parts[1], 10);
  const salt = parts[2];
  const storedHashBase64 = parts[3];
  const keylen = 32;

  try {
    const derivedKey = await pbkdf2Async(candidatePassword, salt, iterations, keylen, digest);
    const hashToCompare = derivedKey.toString('base64');
    return hashToCompare === storedHashBase64;
  } catch (error) {
    console.error("Error al comparar la contraseña del staff:", error);
    return false;
  }
};

const Staff = mongoose.model('Staff', staff);

export default Staff;
