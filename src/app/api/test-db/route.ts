import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase';

export async function GET() {
    try {
        // 1. Verificamos que la tabla 'services' existe y funciona intentando insertar/leer
        // NOTA: Como estamos usando REST, las tablas deben estar creadas en Supabase primero.

        // Attempt to upsert a dummy row into 'services' if the table exists
        const { data: upsertData, error: upsertError } = await supabaseAdmin
            .from('services')
            .upsert({
                id: '123e4567-e89b-12d3-a456-426614174000',
                title: 'Clase de Prueba BBDD (Supabase REST)',
                description: 'Generado automáticamente para probar la base de datos',
                price: 0,
                type: 'SURF',
                is_active: true
            })
            .select()
            .single();

        // Si hay error porque la tabla no existe, lo capturamos
        if (upsertError && upsertError.code === '42P01') {
            return NextResponse.json({
                success: false,
                message: "¡Conexión a Supabase lograda! Pero las tablas aún no existen.",
                instruction: "Por favor ejecuta el script SQL proveído en el Dashboard de Supabase (Editor SQL)."
            });
        } else if (upsertError) {
            throw upsertError;
        }

        // 2. Leemos la tabla después de intentar insertar
        const { data: allServices, error: fetchError } = await supabaseAdmin
            .from('services')
            .select('*');

        if (fetchError) throw fetchError;

        return NextResponse.json({
            success: true,
            message: "¡Conexión a Base de Datos Supabase (REST API) exitosa!",
            testServiceCreated: upsertData,
            allServicesCount: allServices?.length || 0,
            services: allServices
        });

    } catch (error: any) {
        console.error("Error conectando a la BBDD a través de Supabase REST:", error);
        return NextResponse.json(
            {
                success: false,
                error: "Error de conexión a la BBDD",
                details: error.message || error
            },
            { status: 500 }
        );
    }
}
