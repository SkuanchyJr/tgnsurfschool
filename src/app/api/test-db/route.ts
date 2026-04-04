import { NextResponse } from 'next/server';
import pool from '@/lib/db';

export async function GET() {
    try {
        const result = await pool.query(`SELECT id, title, type, is_active FROM services ORDER BY type LIMIT 10`);
        const countResult = await pool.query(`SELECT COUNT(*) as total FROM services`);

        return NextResponse.json({
            success: true,
            message: "¡Conexión a la base de datos PostgreSQL de Replit exitosa!",
            servicesCount: parseInt(countResult.rows[0].total, 10),
            services: result.rows,
        });
    } catch (error: any) {
        console.error("Error conectando a la BBDD:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Error de conexión a la BBDD",
                details: error.message || String(error),
            },
            { status: 500 }
        );
    }
}
