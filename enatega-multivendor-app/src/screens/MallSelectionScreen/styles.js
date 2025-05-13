import { StyleSheet } from "react-native";
import { scale } from "../../utils/scaling"; // Ensure this path is correct
import { alignment } from "../../utils/alignment";

export default (theme) => StyleSheet.create({
  screenBase: {
    flex: 1,
    backgroundColor: theme.themeBackground,
  },
  centerAlign: {
    justifyContent: "center",
    alignItems: "center",
  },
  mallItemContainer: {
    backgroundColor: theme.cardBackground,
    padding: scale(15),
    marginVertical: scale(8),
    marginHorizontal: scale(15),
    borderRadius: scale(8),
    // Add shadow for better visual separation
    shadowColor: theme.shadowColor,
    shadowOffset: {
      width: 0,
      height: scale(1),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    elevation: scale(2),
  },
  backButton: {
    ...alignment.PLsmall,
    alignItems: "center",
  },
});

