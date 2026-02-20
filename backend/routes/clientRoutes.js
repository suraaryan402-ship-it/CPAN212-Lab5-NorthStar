import express from "express";
import {
  renderHome,
  renderClientsList,
  renderClientDetails,

  // SSR CRUD
  renderCreateClientForm,
  createClient,
  renderEditClientForm,
  updateClient,
  renderDeleteClientConfirm,
  deleteClient,

  // API
  apiGetClients,
  apiGetClientById,
  apiCreateClient,
  apiUpdateClient,
  apiDeleteClient
} from "../controllers/clientController.js";

const router = express.Router();

// =======================
// SSR routes
// =======================
router.get("/", renderHome);
router.get("/clients", renderClientsList);

// IMPORTANT: put /clients/new before /clients/:id
router.get("/clients/new", renderCreateClientForm);
router.post("/clients", createClient);

// Update
router.get("/clients/:id/edit", renderEditClientForm);
router.post("/clients/:id/edit", updateClient);

// Delete
router.get("/clients/:id/delete", renderDeleteClientConfirm);
router.post("/clients/:id/delete", deleteClient);

// Keep details last
router.get("/clients/:id", renderClientDetails);

// =======================
// API routes (AngularJS-ready)
// =======================
router.get("/api/clients", apiGetClients);
router.get("/api/clients/:id", apiGetClientById);

// API CRUD
router.post("/api/clients", apiCreateClient);
router.put("/api/clients/:id", apiUpdateClient);
router.delete("/api/clients/:id", apiDeleteClient);

export default router;
