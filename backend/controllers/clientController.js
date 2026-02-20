import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

// ES module __dirname replacement (for controllers folder)
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const dataPath = path.join(__dirname, "..", "data", "clients.json");

const loadClients = () => {
  const raw = fs.readFileSync(dataPath, "utf-8");
  const parsed = JSON.parse(raw);
  return Array.isArray(parsed) ? parsed : [];
};

const saveClients = (clients) => {
  fs.writeFileSync(dataPath, JSON.stringify(clients, null, 2), "utf-8");
};

const getNextId = (clients) => {
  if (!clients || clients.length === 0) return 101;
  const maxId = Math.max(...clients.map((c) => Number(c.id)));
  return maxId + 1;
};

const findClientById = (clients, id) =>
  clients.find((c) => String(c.id) === String(id));

// =======================
// SSR: Home
// =======================
export const renderHome = (req, res) => {
  res.render("pages/home", {
    pageTitle: "Home",
    message:
      "This portal demonstrates dynamic server-side rendering using EJS layouts and partials. JSON APIs are available for an AngularJS frontend that will be added later.",
    now: new Date().toLocaleString(),
  });
};

// =======================
// SSR: Clients list
// =======================
export const renderClientsList = (req, res) => {
  const clients = loadClients();

  res.render("pages/clients", {
    pageTitle: "Clients",
    clients,
    totalClients: clients.length,
    now: new Date().toLocaleString(),
  });
};

// =======================
// SSR: Client details
// =======================
export const renderClientDetails = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).render("pages/home", {
      pageTitle: "Client Not Found",
      message: `No client record found for id: ${req.params.id}`,
      now: new Date().toLocaleString(),
    });
  }

  res.render("pages/clientDetails", {
    pageTitle: "Client Profile",
    clientt,
    now: new Date().toLocaleString(),
  });
};

// =======================
// SSR: Create (Form + Action)
// =======================
export const renderCreateClientForm = (req, res) => {
  res.render("pages/clientCreate", {
    pageTitle: "Create Client",
    now: new Date().toLocaleString(),
  });
};

export const createClient = (req, res) => {
  const clients = loadClients();

  const { fullName, email, riskCategory } = req.body;

  const newClient = {
    id: getNextId(clients),
    fullName: (fullName || "").trim(),
    email: (email || "").trim(),
    riskCategory,
    createdDate: new Date().toISOString().slice(0, 10),
  };

  clients.push(newClient);
  saveClients(clients);

  return res.redirect("/clients");
};

// =======================
// SSR: Update (Form + Action)
// =======================
export const renderEditClientForm = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).render("pages/home", {
      pageTitle: "Client Not Found",
      message: `No client record found for id: ${req.params.id}`,
      now: new Date().toLocaleString(),
    });
  }

  res.render("pages/clientEdit", {
    pageTitle: "Update Client",
    clientt,
    now: new Date().toLocaleString(),
  });
};

export const updateClient = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).render("pages/home", {
      pageTitle: "Client Not Found",
      message: `No client record found for id: ${req.params.id}`,
      now: new Date().toLocaleString(),
    });
  }

  const { fullName, email, riskCategory } = req.body;

  clientt.fullName = (fullName || "").trim();
  clientt.email = (email || "").trim();
  clientt.riskCategory = riskCategory;

  saveClients(clients);

  return res.redirect(`/clients/${clientt.id}`);
};

// =======================
// SSR: Delete (Confirm + Action)
// =======================
export const renderDeleteClientConfirm = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).render("pages/home", {
      pageTitle: "Client Not Found",
      message: `No client record found for id: ${req.params.id}`,
      now: new Date().toLocaleString(),
    });
  }

  res.render("pages/clientDelete", {
    pageTitle: "Delete Client",
    clientt,
    now: new Date().toLocaleString(),
  });
};

export const deleteClient = (req, res) => {
  const clients = loadClients();
  const updated = clients.filter((c) => String(c.id) !== String(req.params.id));
  saveClients(updated);
  return res.redirect("/clients");
};

// =======================
// API: all clients
// =======================
export const apiGetClients = (req, res) => {
  const clients = loadClients();
  res.json({ total: clients.length, clients });
};

// =======================
// API: client by id
// =======================
export const apiGetClientById = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).json({ error: "Client Not Found", id: req.params.id });
  }

  res.json({ clientt });
};

// =======================
// API CRUD (POST / PUT / DELETE)
// =======================
export const apiCreateClient = (req, res) => {
  const clients = loadClients();
  const { fullName, email, riskCategory } = req.body;

  const newClient = {
    id: getNextId(clients),
    fullName: (fullName || "").trim(),
    email: (email || "").trim(),
    riskCategory,
    createdDate: new Date().toISOString().slice(0, 10),
  };

  clients.push(newClient);
  saveClients(clients);

  return res.status(201).json({ clientt: newClient });
};

export const apiUpdateClient = (req, res) => {
  const clients = loadClients();
  const clientt = findClientById(clients, req.params.id);

  if (!clientt) {
    return res.status(404).json({ error: "Client Not Found", id: req.params.id });
  }

  const { fullName, email, riskCategory } = req.body;

  clientt.fullName = (fullName || "").trim();
  clientt.email = (email || "").trim();
  clientt.riskCategory = riskCategory;

  saveClients(clients);

  return res.json({ clientt });
};

export const apiDeleteClient = (req, res) => {
  const clients = loadClients();
  const updated = clients.filter((c) => String(c.id) !== String(req.params.id));
  saveClients(updated);
  return res.json({ deleted: true, id: req.params.id });
};
