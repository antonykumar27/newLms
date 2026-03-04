const express = require("express");
const router = express.Router();
const chatController = require("../constrollers/discussionController");
const { isAuthenticatedUser } = require("../middlewares/authenticate");
const { multerMiddleware } = require("../config/fileUploader");

// Apply authentication to all routes
router.use(isAuthenticatedUser);

// ROOM ROUTES
router.post("/chat/rooms", chatController.createRoom);
router.get("/chat/rooms", chatController.getMyRooms);
router.post("/chat/rooms/:roomId/join", chatController.join);

// MESSAGE ROUTES
router.get("/rooms/:roomId/messages", chatController.getMessages);
router.get("/chat/rooms/:roomId/messages", chatController.getMessages);
router.delete("/chat/messages/:messageId", chatController.deleteMessage);

router.post("/messages/:messageId/pin", chatController.pinMessage);
router.post(
  "/chat/rooms/react/:messageId/members",
  chatController.reactMessage,
);
router.post(
  "/chat/rooms/messages",
  multerMiddleware,
  chatController.createMessage,
);
// USER MANAGEMENT
router.post("/users/:userId/mute", chatController.muteUser);

module.exports = router;
