import { StyleSheet } from 'react-native';
import { scale } from '../../utils/scaling'; // Assuming you have a scaling utility

export default (theme) => StyleSheet.create({
  flex: {
    flex: 1,
  },
  mainContainer: {
    backgroundColor: theme.themeBackground,
  },
  scrollViewStyle: {
    flex: 1,
    backgroundColor: theme.themeBackground,
  },
  subContainer: {
    paddingHorizontal: scale(15),
    marginTop: scale(10),
  },
  backBtnContainer: {
    backgroundColor: theme.white,
    borderRadius: scale(50),
    marginLeft: scale(10),
    width: scale(35),
    height: scale(35),
    justifyContent: 'center',
    alignItems: 'center',
  },
  titleContainer: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    backgroundColor: theme.newheaderBG, // Or your header background color
    paddingHorizontal: scale(15),
    paddingVertical: scale(10),
    borderBottomWidth: 1,
    borderBottomColor: theme.horizontalLine,
  },
  descriptionText: {
    color: theme.fontMainColor,
    lineHeight: scale(22),
    marginVertical: scale(10),
    paddingHorizontal: scale(15),
  },
  line: {
    height: scale(1),
    backgroundColor: theme.lightHorizontalLine,
    marginVertical: scale(20),
  },
  inputContainer: {
    marginBottom: scale(20),
  },
  input: {
    // Style for TextField if needed, often handled by the component itself
  },
  // Add other styles as needed from ItemDetail/styles.js or new ones
});

