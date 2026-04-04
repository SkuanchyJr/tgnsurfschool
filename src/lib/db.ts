import { Pool, types } from 'pg';

// Return DATE columns as plain YYYY-MM-DD strings instead of Date objects
types.setTypeParser(1082, (val: string) => val);

// Return TIMESTAMP / TIMESTAMPTZ columns as ISO strings instead of Date objects
types.setTypeParser(1114, (val: string) => val);
types.setTypeParser(1184, (val: string) => val);

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false,
});

export default pool;

export async function query<T = any>(sql: string, params?: any[]): Promise<T[]> {
    const client = await pool.connect();
    try {
        const result = await client.query(sql, params);
        return result.rows as T[];
    } finally {
        client.release();
    }
}

export async function queryOne<T = any>(sql: string, params?: any[]): Promise<T | null> {
    const rows = await query<T>(sql, params);
    return rows[0] ?? null;
}
