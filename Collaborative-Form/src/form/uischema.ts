// @Elliott https://jsonforms.io/docs/integrations/react#uischema
export const uischema = {
  type: "VerticalLayout",
  elements: [
    // Part 1: Organisational Profile
    {
      type: "Label",
      text: "Part 1: Organisational Profile",
    },
    {
      type: "HorizontalLayout",
      elements: [
        {
          type: "Control",
          scope: "#/properties/missionVisionValues",
          options: {
            multiline: true, // For a textarea input
          },
        },
        {
          type: "Control",
          scope: "#/properties/employeeProfile",
        },
      ],
    },
    {
      type: "Control",
      scope: "#/properties/keyEquipments",
    },
    {
      type: "Control",
      scope: "#/properties/mainProductsServices",
      options: {
        multiline: true, // For a textarea input
      },
    },
    // Part 2: Organisational Structure and Market
    {
      type: "Label",
      text: "Part 2: Organisational Structure and Market",
    },
    {
      type: "Control",
      scope: "#/properties/organizationalChart",
    },
    {
      type: "Control",
      scope: "#/properties/majorMarketsCustomers",
    },
    {
      type: "Control",
      scope: "#/properties/customerRequirements",
    },
    {
      type: "Control",
      scope: "#/properties/partnersSuppliers",
    },
    {
      type: "Control",
      scope: "#/properties/partnerSupplierRequirements",
    },
    // Part 3: Organisational Challenges
    {
      type: "Label",
      text: "Part 3: Organisational Challenges",
    },
    {
      type: "Control",
      scope: "#/properties/competitiveChallenges",
    },
    {
      type: "Control",
      scope: "#/properties/competitivePosition",
    },
  ],
};
