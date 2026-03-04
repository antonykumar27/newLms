const mongoose = require("mongoose");
const standardsData = [
  // ==================== ENGLISH MEDIUM ====================
  // 🟢 Class 1 English
  {
    standard: 1,
    medium: "english",
    pricing: {
      monthly: 399,
      yearly: 3999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class1-english-cover.jpg",
        type: "image",
      },
      {
        url: "https://your-cdn.com/class1-english-brochure.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class1-english-brochure.pdf",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 2 English
  {
    standard: 2,
    medium: "english",
    pricing: {
      monthly: 399,
      yearly: 3999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class2-english-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 3 English
  {
    standard: 3,
    medium: "english",
    pricing: {
      monthly: 399,
      yearly: 3999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class3-english-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 4 English
  {
    standard: 4,
    medium: "english",
    pricing: {
      monthly: 399,
      yearly: 3999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class4-english-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 5 English
  {
    standard: 5,
    medium: "english",
    pricing: {
      monthly: 399,
      yearly: 3999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class5-english-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 6 English
  {
    standard: 6,
    medium: "english",
    pricing: {
      monthly: 449,
      yearly: 4499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 12,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class6-english-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 7 English
  {
    standard: 7,
    medium: "english",
    pricing: {
      monthly: 449,
      yearly: 4499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 12,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class7-english-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 8 English
  {
    standard: 8,
    medium: "english",
    pricing: {
      monthly: 449,
      yearly: 4499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 12,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class8-english-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 9 English
  {
    standard: 9,
    medium: "english",
    pricing: {
      monthly: 499,
      yearly: 4999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 10,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class9-english-cover.jpg",
        type: "image",
      },
      {
        url: "https://your-cdn.com/class9-english-brochure.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class9-english-brochure.pdf",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 10 English
  {
    standard: 10,
    medium: "english",
    pricing: {
      monthly: 499,
      yearly: 4999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 10,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class10-english-cover.jpg",
        type: "image",
      },
      {
        url: "https://your-cdn.com/class10-english-brochure.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class10-english-brochure.pdf",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 11 English
  {
    standard: 11,
    medium: "english",
    pricing: {
      monthly: 599,
      yearly: 5999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 8,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class11-english-cover.jpg",
        type: "image",
      },
      {
        url: "https://your-cdn.com/class11-english-science.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class11-english-science.pdf",
      },
      {
        url: "https://your-cdn.com/class11-english-commerce.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class11-english-commerce.pdf",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟢 Class 12 English
  {
    standard: 12,
    medium: "english",
    pricing: {
      monthly: 599,
      yearly: 5999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 8,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class12-english-cover.jpg",
        type: "image",
      },
      {
        url: "https://your-cdn.com/class12-english-science.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class12-english-science.pdf",
      },
      {
        url: "https://your-cdn.com/class12-english-commerce.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class12-english-commerce.pdf",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // ==================== MALAYALAM MEDIUM ====================
  // 🟡 Class 1 Malayalam
  {
    standard: 1,
    medium: "malayalam",
    pricing: {
      monthly: 349,
      yearly: 3499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class1-malayalam-cover.jpg",
        type: "image",
      },
      {
        url: "https://your-cdn.com/class1-malayalam-brochure.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class1-malayalam-brochure.pdf",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 2 Malayalam
  {
    standard: 2,
    medium: "malayalam",
    pricing: {
      monthly: 349,
      yearly: 3499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class2-malayalam-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 3 Malayalam
  {
    standard: 3,
    medium: "malayalam",
    pricing: {
      monthly: 349,
      yearly: 3499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class3-malayalam-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 4 Malayalam
  {
    standard: 4,
    medium: "malayalam",
    pricing: {
      monthly: 349,
      yearly: 3499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class4-malayalam-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 5 Malayalam
  {
    standard: 5,
    medium: "malayalam",
    pricing: {
      monthly: 349,
      yearly: 3499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 15,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class5-malayalam-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 6 Malayalam
  {
    standard: 6,
    medium: "malayalam",
    pricing: {
      monthly: 399,
      yearly: 3999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 12,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class6-malayalam-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 7 Malayalam
  {
    standard: 7,
    medium: "malayalam",
    pricing: {
      monthly: 399,
      yearly: 3999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 12,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class7-malayalam-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 8 Malayalam
  {
    standard: 8,
    medium: "malayalam",
    pricing: {
      monthly: 399,
      yearly: 3999,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 12,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class8-malayalam-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 9 Malayalam
  {
    standard: 9,
    medium: "malayalam",
    pricing: {
      monthly: 449,
      yearly: 4499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 10,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class9-malayalam-cover.jpg",
        type: "image",
      },
      {
        url: "https://your-cdn.com/class9-malayalam-brochure.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class9-malayalam-brochure.pdf",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 10 Malayalam
  {
    standard: 10,
    medium: "malayalam",
    pricing: {
      monthly: 449,
      yearly: 4499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 10,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class10-malayalam-cover.jpg",
        type: "image",
      },
      {
        url: "https://your-cdn.com/class10-malayalam-brochure.pdf",
        type: "pdf",
        pdfUrl: "https://your-cdn.com/class10-malayalam-brochure.pdf",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 11 Malayalam
  {
    standard: 11,
    medium: "malayalam",
    pricing: {
      monthly: 549,
      yearly: 5499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 8,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class11-malayalam-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },

  // 🟡 Class 12 Malayalam
  {
    standard: 12,
    medium: "malayalam",
    pricing: {
      monthly: 549,
      yearly: 5499,
    },
    gstPercentage: 18,
    discount: {
      type: "percentage",
      value: 8,
      appliesTo: "yearly",
    },
    media: [
      {
        url: "https://your-cdn.com/class12-malayalam-cover.jpg",
        type: "image",
      },
    ],
    createdBy: new mongoose.Types.ObjectId("6982e34ecbb9580e08d7ddee"),
  },
];

module.exports = standardsData;
