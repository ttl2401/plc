import mongoose, { Document, Schema } from 'mongoose';

export interface IMigration extends Document {
    file: string;
    createdAt: Date;
    updatedAt: Date;
}

const migrationSchema = new Schema<IMigration>(
    {
        file: {
            type: String,
            required: true,
            unique: true,
        },
    },
    {
        timestamps: true,
    }
);

export const Migrations = mongoose.model<IMigration>('Migration', migrationSchema); 