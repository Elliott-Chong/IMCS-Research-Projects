// @Elliott https://jsonforms.io/docs/integrations/react#schema

export const schema = {
  type: "object",
  properties: {
    // Part 1: Organisational Profile
    missionVisionValues: {
      type: "string",
      title: "Mission, Vision, and Values",
      description:
        "Describe the mission, vision, and values of the organization",
    },
    mainProductsServices: {
      type: "string",
      title: "Main Products and Services",
      description:
        "Describe the main products and services of the organization",
    },
    employeeProfile: {
      type: "string",
      title: "Employee Profile",
      description: "Describe the employee profile of the organization",
    },
    keyEquipments: {
      type: "number",
      title:
        "Describe the key equipment, facilities, or technologies used to deliver your products and services",
      description:
        "Describe the key equipment, facilities, or technologies used to deliver your products and services",
    },

    // Part 2: Organisational Structure and Market
    organizationalChart: {
      type: "string",
      title: "Organisational Chart/Structure",
    },
    majorMarketsCustomers: {
      type: "string",
      title: "Major Markets and Principal Customer Types",
    },
    customerRequirements: {
      type: "string",
      title: "Customer Key Requirements",
    },
    partnersSuppliers: {
      type: "string",
      title: "Number and Types of Partners and Suppliers",
    },
    partnerSupplierRequirements: {
      type: "string",
      title: "Key Requirements for Suppliers and/or Partners",
    },
    // Part 3: Organisational Challenges
    competitiveChallenges: {
      type: "string",
      title: "Competitive Environment Challenges",
    },
    competitivePosition: {
      type: "string",
      title: "Organisation's Position Compared to Competitors",
    },
  },
  required: [
    "missionVisionValues",
    "mainProductsServices",
    "organizationalChart",
    "majorMarketsCustomers",
    "customerRequirements",
    "partnersSuppliers",
    "partnerSupplierRequirements",
    "competitiveChallenges",
    "competitivePosition",
    "employeeProfile",
    "keyEquipments",
  ],
};
