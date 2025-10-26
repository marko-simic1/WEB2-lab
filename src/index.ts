import "dotenv/config";
import express = require("express");
import path = require("path");
import { oidc, jwtCheck, requireManage } from "./auth";
import { openNewRound, closeActiveRound, storeResultsDb } from "./db";
import { requireLogin } from "./auth";
import { createTicket } from "./db";
import { validateUserInput, validateUserId } from "./validate";
import { getTicketWithRound, getLatestRound, countTicketsInRound } from "./db";
import QRCode = require("qrcode");

const app = express();

app.use(oidc);
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.set("view engine", "pug");
app.set("views", path.join(__dirname, "views"));
app.use(express.static(path.join(__dirname, "public")));

app.get("/", async (req, res) => {
    const user = req.oidc?.user ?? null;
    const latest = await getLatestRound();
    const isActive = latest ? !!latest.is_active : null;
    const ticketCount = latest ? await countTicketsInRound(latest.id) : null;
    const drawNumbers = latest?.draw_numbers ?? null;
    res.render("index", { user, isActive, ticketCount, drawNumbers });
});

app.post("/tickets", requireLogin, async (req, res) => {
    try {
        const userId = validateUserId(req.body?.user_id);
        const numbers = validateUserInput(req.body?.numbers);
        const { id } = await createTicket(userId, numbers);
        return res.redirect(303, `/ticket/${id}`);
    } catch (e: any) {
        const latest = await getLatestRound();
        const isActive = latest ? !!latest.is_active : false;
        return res.status(400).render("ticket-new", {
            isActive,
            error: e.message ?? "Neispravni podaci.",
            values: { user_id: req.body?.user_id ?? "", numbers: req.body?.numbers ?? "" }
        });
    }
});

app.get("/tickets/new", requireLogin, async (req, res) => {
    const latest = await getLatestRound();
    const isActive = latest ? !!latest.is_active : false;
    res.render("ticket-new", { isActive, error: null, values: { user_id: "", numbers: "" } });
});

app.post("/new-round", jwtCheck, requireManage, async (_req, res) => {
    await openNewRound();
    res.sendStatus(204);
});

app.post("/close", jwtCheck, requireManage, async (_req, res) => {
    await closeActiveRound();
    res.sendStatus(204);
});

app.post("/store-results", jwtCheck, requireManage, async (req, res) => {
    const numbers = req.body?.numbers;
    if (!Array.isArray(numbers)) return res.sendStatus(400);
    const ok = await storeResultsDb(numbers.map(Number));
    return res.sendStatus(ok ? 204 : 400);
});

app.get("/ticket/:id", async (req, res) => {
    const tick = await getTicketWithRound(req.params.id);
    if (!tick) return res.status(404).send("Listić nije pronađen");

    res.render("ticket", {
        ticket: {id: tick.ticket_id, numbers: tick.numbers},
        drawNumbers: tick.draw_numbers ?? null
    });
});

app.get("/ticket/:id/qr", async (req, res) => {
    const ticketId = req.params.id;
    const base = process.env.BASE_URL || `http://localhost:${process.env.PORT || 3000}`;
    const url = `${base}/ticket/${ticketId}`;
    res.setHeader("Content-Type", "image/png");
    QRCode.toFileStream(res, url, { type: "png", width: 300 });
});

const PORT = Number(process.env.PORT) || 3000;
app.listen(PORT, () => {
    console.log(`App running at http://localhost:${PORT}`);
});
