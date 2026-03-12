export const AUDIT_INDEX = {
  entries: [
    { id: "A1", title: "Baseline Governance Audit", status: "pending", category: "governance" },
    { id: "A2", title: "Routing Audit", status: "pending", category: "architecture" },
    { id: "A3", title: "Data Flow Audit", status: "pending", category: "data" },
    {
      id: "P1",
      title: "Product Utility Audit",
      status: "complete",
      category: "product",
      file: "src/components/audits/product/product-utility-audit-2026-03-11.jsx",
      date: "2026-03-11",
    },
    {
      id: "P2",
      title: "Product Intelligence Audit",
      status: "complete",
      category: "product",
      file: "src/components/audits/product/product-intelligence-audit-2026-03-12.jsx",
      date: "2026-03-12",
    },
  ],
};
