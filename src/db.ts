import { Pool } from "pg";

export const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

export async function getActiveRound() {
    const r = await pool.query("SELECT * FROM rounds WHERE is_active = true ORDER BY created_at DESC LIMIT 1");
    return r.rows[0] ?? null;
}

export async function getLatestRound() {
    const r = await pool.query("SELECT * FROM rounds ORDER BY created_at DESC, id DESC LIMIT 1");
    return r.rows[0] ?? null;
}

export async function openNewRound() {
    const active = await getActiveRound();
    if (active) return;
    await pool.query("INSERT INTO rounds(is_active) VALUES (true)");
}

export async function closeActiveRound() {
    await pool.query("UPDATE rounds SET is_active=false, closed_at=now() WHERE is_active=true");
}

export async function storeResultsDb(numbers: number[]) {
    const latest = await getLatestRound();
    if (!latest) return false;
    if (latest.is_active) return false;
    if (latest.draw_numbers) return false;

    await pool.query("UPDATE rounds SET draw_numbers=$1 WHERE id=$2", [numbers, latest.id]);
    return true;
}

export async function createTicket(userId: string, numbers: number[]) {
    const active = await getActiveRound();
    if (!active) throw new Error("Uplate nisu aktivne");
    const r = await pool.query("INSERT INTO tickets(round_id, national_id, numbers) VALUES ($1,$2,$3) RETURNING id",[active.id, userId, numbers]);
    return { id: r.rows[0].id, roundId: active.id };
}


export async function countTicketsInRound(roundId: number) {
  const r = await pool.query("SELECT COUNT(*)::int AS c FROM tickets WHERE round_id=$1", [roundId]);
  return r.rows[0]?.c ?? 0;
}


export async function getTicketWithRound(ticketId: string) {
    const r = await pool.query(
        `SELECT 
            t.id AS ticket_id,
            t.national_id,
            t.numbers,
            t.created_at,
            r.id AS round_id,
            r.is_active,
            r.draw_numbers
            FROM tickets t JOIN rounds r ON r.id = t.round_id WHERE t.id = $1`, [ticketId]
    );
    return r.rows[0] ?? null;
}
