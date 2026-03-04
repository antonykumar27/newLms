// FINAL OPTIMIZED VERSION - Put this in /src/models/schemas/blockSchema.js

const mongoose = require("mongoose");

const blockSchema = new mongoose.Schema(
  {
    type: {
      type: String,
      enum: [
        "heading",
        "paragraph",
        "image",
        "bullet",
        "numbered",
        "definition",
        "example",
        "formula",
        "table",
        "quote",
        "code",
        "video",
        "question",
        "note",
        "divider",
      ],
      required: [true, "Block type is required"],
      trim: true,
    },

    data: {
      type: mongoose.Schema.Types.Mixed,
      required: [true, "Block data is required"],

      // Dynamic validation based on type
      validate: {
        validator: function (value) {
          switch (this.type) {
            case "heading":
            case "paragraph":
              return typeof value === "string" && value.trim().length > 0;

            case "image":
              return (
                value &&
                typeof value.url === "string" &&
                value.url.trim().length > 0
              );

            case "bullet":
            case "numbered":
              return (
                Array.isArray(value) &&
                value.length > 0 &&
                value.every(
                  (item) => typeof item === "string" && item.trim().length > 0,
                )
              );

            case "formula":
              return value && (value.latex || value.text);

            case "question":
              return (
                value &&
                typeof value.question === "string" &&
                value.question.trim().length > 0
              );

            default:
              return true;
          }
        },
        message: "Invalid data for block type: {VALUE}",
      },
    },

    order: {
      type: Number,
      required: [true, "Order is required"],
      min: 0,
      default: function () {
        // Auto-increment if not provided
        return this.parent().content ? this.parent().content.length : 0;
      },
    },

    style: {
      align: {
        type: String,
        enum: ["left", "center", "right", "justify"],
        default: "left",
      },
      color: String,
      backgroundColor: String,
      fontSize: {
        type: String,
        validate: {
          validator: function (v) {
            return /^(\d+(px|em|rem|%))|(small|medium|large)$/.test(v);
          },
          message: "Invalid font size",
        },
      },
      fontWeight: {
        type: String,
        enum: [
          "normal",
          "bold",
          "bolder",
          "lighter",
          "100",
          "200",
          "300",
          "400",
          "500",
          "600",
          "700",
          "800",
          "900",
        ],
      },
    },

    // Metadata
    metadata: {
      createdAt: {
        type: Date,
        default: Date.now,
      },
      createdBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User",
      },
      lastModified: {
        type: Date,
        default: Date.now,
      },
    },
  },
  {
    _id: false,
    toJSON: { virtuals: true },
    toObject: { virtuals: true },
  },
);

// Virtual for block ID (combines type + order)
blockSchema.virtual("blockId").get(function () {
  return `${this.type}_${this.order}`;
});

module.exports = blockSchema;
