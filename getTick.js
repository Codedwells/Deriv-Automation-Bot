const WebSocket = require("ws");
const DerivAPIBasic = require("@deriv/deriv-api/dist/DerivAPIBasic");
const { Logger } = require("borgen");

const app_id = 36692; // Replace with your app_id or leave as 1089 for testing.
const connection = new WebSocket(
  `wss://ws.binaryws.com/websockets/v3?app_id=${app_id}`
);
const api = new DerivAPIBasic({ connection });

// Get current tick for an instrument
const tickStream = () => api.subscribe({ ticks: "R_75" });

const tickResponse = async (res) => {
  const data = JSON.parse(res.data);
  if (data.error !== undefined) {
    console.log("Error : ", data.error.message);
    connection.removeEventListener("message", tickResponse, false);
    await api.disconnect();
  }
  if (data.msg_type === "tick") {
    console.log(data.tick);
    Logger.info(data.tick);
  }
};

const subscribeTicks = async () => {
  await tickStream();
  connection.addEventListener("message", tickResponse);
};

const unsubscribeTicks = () => {
  connection.removeEventListener("message", tickResponse, false);
  tickStream().unsubscribe();
};

// Get all the Active Symbols
const active_symbols_request = {
  // landing_company: "maltainvest", // Uncomment landing_company if you want to retrieve specific symbols.
  active_symbols: "brief",
  product_type: "basic",
};

const activeSymbolsResponse = async (res) => {
  const data = JSON.parse(res.data);

  if (data.error !== undefined) {
    console.log("Error : ", data.error?.message);
    connection.removeEventListener("message", activeSymbolsResponse, false);
    await api.disconnect();
  }

  if (data.msg_type === "active_symbols") {
    console.log(data.active_symbols);
  }

  connection.removeEventListener("message", activeSymbolsResponse, false);
};

const getActiveSymbols = async () => {
  connection.addEventListener("message", activeSymbolsResponse);
  await api.activeSymbols(active_symbols_request);
};

// Contracts for a certain symbol
const contracts_for_symbol_request = {
  contracts_for: "R_50",
  currency: "USD",
  landing_company: "svg",
  product_type: "basic",
};

const contractsForSymbolResponse = async (res) => {
  const data = JSON.parse(res.data);

  if (data.error !== undefined) {
    console.log("Error : ", data.error?.message);
    connection.removeEventListener(
      "message",
      contractsForSymbolResponse,
      false
    );
    await api.disconnect();
  }

  if (data.msg_type === "contracts_for") {
    console.log(data.contracts_for);
  }

  connection.removeEventListener("message", contractsForSymbolResponse, false);
};

const getContractsForSymbol = async () => {
  connection.addEventListener("message", contractsForSymbolResponse);
  await api.contractsFor(contracts_for_symbol_request);
};

// Proposal
const proposal_request = {
  proposal: 1,
  subscribe: 1,
  amount: 10,
  basis: "payout",
  contract_type: "CALL",
  currency: "USD",
  duration: 1,
  duration_unit: "m",
  symbol: "R_75",
  barrier: "+0.1",
};

const proposalResponse = async (res) => {
  const data = JSON.parse(res.data);
  if (data.error !== undefined) {
    console.log("Error: %s ", data.error.message);
    connection.removeEventListener("message", proposalResponse, false);
    await api.disconnect();
  } else if (data.msg_type === "proposal") {
    console.log("Details: %s", data.proposal.longcode);
    console.log("Ask Price: %s", data.proposal.display_value);
    console.log("Payout: %f", data.proposal.payout);
    console.log("Spot: %f", data.proposal.spot);
  }
};

const getProposal = async () => {
  connection.addEventListener("message", proposalResponse);
  await api.proposal(proposal_request);
};

const unsubscribeProposal = () => {
  connection.removeEventListener("message", proposalResponse, false);
};

module.exports = { subscribeTicks, unsubscribeTicks, getActiveSymbols };
