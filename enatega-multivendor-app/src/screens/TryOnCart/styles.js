import { StyleSheet } from 'react-native';
import { scale } from '../../utils/scaling';
import { alignment } from '../../utils/alignment';

export default (theme) => StyleSheet.create({
  flex: {
    flex: 1,
  },
  mainContainer: {
    flex: 1,
    backgroundColor: theme.themeBackground,
  },
  screenBackground: {
    backgroundColor: theme.themeBackground,
    flex:1,
  },
  cartItems: {
    flex: 1,
  },
  cartItemsContainer: {
    ...alignment.PLsmall,
    ...alignment.PRsmall,
    marginTop: scale(10),
  },
  itemContainer: {
    marginBottom: scale(10),
    borderBottomWidth: scale(1),
    borderBottomColor: theme.lightHorizontalLine,
    paddingBottom: scale(10),
  },
  totalOrder: {
    marginBottom: scale(10),
    color: theme.fontMainColor, 
  },
  subContainerImage: {
    flexGrow: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: scale(20),
  },
  imageContainer: {
    width: scale(200),
    height: scale(200),
    justifyContent: 'center',
    alignItems: 'center',
  },
  descriptionEmpty: {
    marginTop: scale(20),
    marginBottom: scale(20),
  },
  emptyButton: {
    backgroundColor: theme.buttonBackgroundPink,
    paddingVertical: scale(12),
    paddingHorizontal: scale(30),
    borderRadius: scale(5),
    alignItems: 'center',
    justifyContent: 'center',
  },
  placeHolderContainer: {
    padding: scale(10),
    marginVertical: scale(5),
    backgroundColor: theme.cardBackground,
    borderRadius: scale(5),
  },
  placeHolderFadeColor: {
    backgroundColor: theme.horizontalLine,
  },
  totalBillContainer: {
    paddingHorizontal: scale(15),
    paddingVertical: scale(10),
    borderTopWidth: scale(1),
    borderTopColor: theme.lightHorizontalLine,
    backgroundColor: theme.themeBackground, // Or cardBackground if preferred
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  cartAmount: {
    // Styles for the total amount display
  },
  totalBill: {
    // Styles for the total bill text
  },
  checkoutButton: {
    backgroundColor: theme.buttonBackgroundPink, // Or primary color
    paddingVertical: scale(15),
    paddingHorizontal: scale(20),
    borderRadius: scale(8),
    flex: 1, // Make button take available space if cartAmount is on the left
    marginLeft: scale(10), // If cartAmount is on the left
    alignItems: 'center',
  },
  backButton: {
    ...alignment.PLsmall,
    alignItems: 'center',
  },
  feeSummaryContainer: {
    marginVertical: scale(20),
    marginHorizontal: scale(15),
    padding: scale(15),
    backgroundColor: theme.cardBackground,
    borderRadius: scale(8),
  },
  summaryTitle: {
    marginBottom: scale(10),
    color: theme.fontMainColor,
  },
  feeRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: scale(8),
  },
  totalFeeRow: {
    borderTopWidth: scale(1),
    borderTopColor: theme.lightHorizontalLine,
    marginTop: scale(5),
    paddingTop: scale(8),
  },
  instructionsContainer: {
    ...alignment.PLsmall,
    ...alignment.PRsmall,
    marginTop: scale(10),
    marginBottom: scale(10),
  }
});

