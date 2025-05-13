import { StyleSheet } from "react-native";
import { scale } from "../../utils/scaling"; // Ensure this path is correct

export default (theme) => StyleSheet.create({
  screenBase: {
    flex: 1,
    backgroundColor: theme.themeBackground,
  },
  scrollContainer: {
    paddingBottom: scale(100), // Space for the confirm button
  },
  timerContainer: {
    alignItems: "center",
    marginVertical: scale(20),
  },
  extendButton: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: scale(10),
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    borderRadius: scale(20),
    borderWidth: 1,
    borderColor: theme.iconColorPink,
  },
  extendButtonText: {
    marginLeft: scale(5),
  },
  instructionsText: {
    textAlign: "center",
    marginHorizontal: scale(15),
    marginBottom: scale(20),
    color: theme.fontMainColor,
  },
  itemList: {
    marginHorizontal: scale(15),
  },
  confirmButton: {
    backgroundColor: theme.buttonBackgroundPink, // Or your primary color
    paddingVertical: scale(15),
    alignItems: "center",
    justifyContent: "center",
    marginHorizontal: scale(15),
    borderRadius: scale(8),
    position: "absolute", // Fixed at the bottom
    bottom: scale(20),
    left: scale(15),
    right: scale(15),
  },
  // Styles for TryOnSelectionItem (placeholder, move to its own file if it becomes complex)
  selectionItemContainer: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: theme.cardBackground,
    padding: scale(10),
    borderRadius: scale(8),
    marginBottom: scale(10),
    shadowColor: theme.shadowColor,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  itemImage: {
    width: scale(50),
    height: scale(65),
    borderRadius: scale(4),
    marginRight: scale(10),
  },
  itemInfoContainer: {
    flex: 1,
  },
  itemActionsContainer: {
    flexDirection: "row",
  },
  actionButton: {
    paddingVertical: scale(8),
    paddingHorizontal: scale(12),
    borderRadius: scale(5),
    borderWidth: 1,
    borderColor: theme.lightHorizontalLine,
    marginLeft: scale(5),
  },
  selectedButtonKeep: {
    backgroundColor: theme.iconColorPink,
    borderColor: theme.iconColorPink,
  },
  selectedButtonReturn: {
    backgroundColor: theme.textErrorColor,
    borderColor: theme.textErrorColor,
  },
});

