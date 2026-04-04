import { NextResponse } from 'next/server';
import OpenAI from 'openai';

// Initialize the OpenAI client. 
// It automatically uses the OPENAI_API_KEY environment variable.
const openai = new OpenAI({
    apiKey: process.env.OPENAI_API_KEY || 'dummy_key', // Providing a fallback so it doesn't crash on build if key is missing
});

export async function GET() {
    try {
        // 1. MOCK EXTERNAL DATA (e.g., AEMET beach forecast)
        // En un escenario real, haríamos fetch() a la API de AEMET
        const currentSeaConditions = {
            location: "Platja de la Pineda, Tarragona",
            waveHeight_meters: 0.6,
            wavePeriod_seconds: 5,
            windSpeed_kmh: 12,
            windDirection: "Sur-Suroeste",
            waterTemp_celsius: 18,
            weather: "Soleado",
        };

        // Si no hay API key real configurada, devolvemos un mock para que la UI no se rompa
        if (!process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY === 'dummy_key') {
            return NextResponse.json({
                success: true,
                data: {
                    generalState: "Bueno",
                    bestTime: "09:00 - 13:00",
                    recommendedLevel: "Principiante / Intermedio",
                    recommendedActivity: "Surf / Surfskate",
                    aiObservation: "Hoy las condiciones son ideales para dar tus primeros pasos. El mar está ordenado en La Pineda con olas por la cintura. Recomendamos clase de iniciación o un baño tranquilo por la mañana antes de que entre el viento térmico.",
                    tipOfTheDay: "No olvides tu crema de sol y un buen calentamiento preventivo.",
                    rawConditions: currentSeaConditions
                }
            });
        }

        // 2. CALL OPENAI API
        const prompt = `
      Eres un meteorólogo e instructor experto de la escuela TGN Surf en Tarragona.
      Recibes estos datos meterológicos actuales de la playa:
      - Olas: ${currentSeaConditions.waveHeight_meters}m
      - Periodo: ${currentSeaConditions.wavePeriod_seconds}s
      - Viento: ${currentSeaConditions.windSpeed_kmh}km/h (${currentSeaConditions.windDirection})
      - Tiempo: ${currentSeaConditions.weather}

      Debes generar una recomendación para los alumnos de la escuela de surf.
      Devuelve ÚNICAMENTE un objeto JSON válido con la siguiente estructura (sin bloques de código markdown, solo el JSON puro):
      {
        "generalState": "Breve estado general (ej. Bueno, Regular, Plato, Épico...)",
        "bestTime": "Mejor franja horaria sugerida",
        "recommendedLevel": "Principiante, Intermedio, o Avanzado",
        "recommendedActivity": "Surf, Surfskate, o Esperar",
        "aiObservation": "Un párrafo humano y motivador analizando las condiciones y dando contexto de seguridad/disfrute",
        "tipOfTheDay": "Consejo de seguridad o disfrute breve"
      }
    `;

        const response = await openai.chat.completions.create({
            model: "gpt-4o-mini", // o el modelo preferido
            messages: [
                { role: "system", content: "You are a helpful surf instructor data API. Respond only in valid JSON." },
                { role: "user", content: prompt }
            ],
            temperature: 0.4,
        });

        const aiContent = response.choices[0].message.content;

        // Safety check para parsear el JSON
        const parsedData = JSON.parse(aiContent?.replace(/```json/g, '').replace(/```/g, '') || '{}');

        return NextResponse.json({
            success: true,
            data: {
                ...parsedData,
                rawConditions: currentSeaConditions
            }
        });

    } catch (error: any) {
        console.error("Error generating AI Forecast:", error);
        return NextResponse.json(
            { success: false, error: "Error fetching surf forecast." },
            { status: 500 }
        );
    }
}
