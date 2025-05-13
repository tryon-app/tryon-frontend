import { StyleSheet } from 'react-native';
import { scale } from '../../utils/scaling'; // Ensure this path is correct

export default (theme) => StyleSheet.create({
  container: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(10),
    backgroundColor: theme.cardBackground, // Or theme.themeBackground
    borderRadius: scale(8),
    paddingHorizontal: scale(10),
    marginBottom: scale(10),
    // Add shadow or border if needed for better separation
    shadowColor: theme.shadowColor,
    shadowOffset: {
      width: 0,
      height: scale(1),
    },
    shadowOpacity: 0.1,
    shadowRadius: scale(2),
    elevation: scale(2),
  },
  leftContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, // Allow text to take available space and wrap
  },
  image: {
    width: scale(60),
    height: scale(75), // Adjust for clothing item aspect ratio
    borderRadius: scale(5),
    marginRight: scale(10),
  },
  imagePlaceholder: {
    width: scale(60),
    height: scale(75),
    borderRadius: scale(5),
    marginRight: scale(10),
    backgroundColor: theme.lightHorizontalLine, // Placeholder color
  },
  infoContainer: {
    flex: 1, // Allow text to take available space
    justifyContent: 'center',
  },
  rightContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    paddingLeft: scale(10), // Space between info and remove button
  },
  removeButton: {
    padding: scale(5), // Make it easier to tap
  },
});

