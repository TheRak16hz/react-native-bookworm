import mongoose from "mongoose";

// Definimos el Schema para la colección de estudiantes
const accounts_estudiante = new mongoose.Schema(
  {
    // El campo 'id' de tu ejemplo parece ser un identificador numérico personalizado.
    // Si lo generas tú mismo, puedes definirlo así.
    id: {
      type: Number,
      required: true,
      unique: true, // Si cada estudiante debe tener un 'id' numérico único.
    },
    nombre: {
      type: String,
      required: [true, 'El nombre es obligatorio'],
      trim: true, // Elimina espacios en blanco al inicio y al final
      text: true, // Permite indexar para búsquedas de texto
    },
    apellido: {
      type: String,
      required: [true, 'El apellido es obligatorio'],
      trim: true,
      text: true,
    },
    cedula: {
      type: String,
      required: [true, 'La cédula es obligatoria'],
      unique: true, // Asegura que no haya dos estudiantes con la misma cédula
      trim: true,
    },
    email: {
      type: String,
      required: [true, 'El correo electrónico es obligatorio'],
      unique: true,
      trim: true,
      lowercase: true, // Guarda el email en minúsculas para evitar duplicados por mayúsculas
      match: [
        /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/,
        'Por favor, introduce un correo electrónico válido',
      ],
    },
    seccion: {
      type: String,
      required: true,
      trim: true,
      // Opcional: Si solo hay secciones específicas, puedes usar un enum
      // enum: ['A', 'B', 'C', 'D', 'E'] 
    },
    fecha_nacimiento: {
      type: Date,
      required: [true, 'La fecha de nacimiento es obligatoria'],
    },
    numero_telefono: {
      type: String,
      required: [true, 'El número de teléfono es obligatorio'],
      trim: true,
    },
    direccion: {
      type: String,
      required: [true, 'La dirección es obligatoria'],
      trim: true,
    },
    sexo: {
      type: String,
      required: true,
      enum: { // Limita los valores posibles a solo estos dos
        values: ['masculino', 'femenino'],
        message: '{VALUE} no es un sexo válido',
      },
    },
    status: {
      type: Boolean,
      default: true, // Por defecto, un nuevo estudiante estará activo (true)
    },
    ultimo_año_cursado: {
      type: String, // Se guarda como String según tu ejemplo
      required: [true, 'El último año cursado es obligatorio'],
    },
  },
  {
    // Opciones del Schema
    timestamps: true, // Crea automáticamente los campos `createdAt` y `updatedAt`
    collection: 'accounts_estudiante' // Especifica el nombre exacto de la colección
  }
);

// Creamos y exportamos el modelo a partir del Schema
// Mongoose usará el nombre de la colección 'accounts_estudiantes' que especificamos arriba.
const Student = mongoose.model('accounts_estudiante', accounts_estudiante);

export default Student;