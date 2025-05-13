import React, { useState, useContext, useLayoutEffect, useEffect } from 'react';
import { View, TouchableOpacity, StatusBar, FlatList, ActivityIndicator } from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { theme } from '../../utils/themeColors';
import TextDefault from '../../components/Text/TextDefault/TextDefault';
import styles from './styles'; // Will create this file
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import UserContext from '../../context/User'; // To store selected mall
import { useNavigation, useFocusEffect } from '@react-navigation/native';
import { useTranslation } from 'react-i18next';
import { HeaderBackButton } from '@react-navigation/elements';
import { AntDesign } from '@expo/vector-icons';
import navigationService from '../../routes/navigationService';
import { gql, useQuery } from '@apollo/client'; // For fetching malls
import ErrorView from '../../components/ErrorView/ErrorView';
import { scale } from '../../utils/scaling';

// Example GraphQL query to fetch malls (adapt to your actual schema)
const GET_MALLS = gql`
  query GetMalls {
    malls {
      _id
      name
      address
      // Add other relevant fields like location, image, etc.
    }
  }
`;

function MallSelectionScreen(props) {
  const { t, i18n } = useTranslation();
  const themeContext = useContext(ThemeContext);
  const { setSelectedMall } = useContext(UserContext); // Function to set the selected mall in context
  const currentTheme = { isRTL: i18n.dir() === 'rtl', ...theme[themeContext.ThemeValue] };
  const navigation = useNavigation();
  const inset = useSafeAreaInsets();

  const { loading, error, data } = useQuery(GET_MALLS);

  useFocusEffect(
    React.useCallback(() => {
      if (Platform.OS === 'android') {
        StatusBar.setBackgroundColor(currentTheme.menuBar);
      }
      StatusBar.setBarStyle(themeContext.ThemeValue === 'Dark' ? 'light-content' : 'dark-content');
    }, [currentTheme, themeContext.ThemeValue])
  );

  useLayoutEffect(() => {
    navigation.setOptions({
      title: t('Select Mall'),
      headerTitleAlign: 'center',
      headerStyle: {
        backgroundColor: currentTheme.newheaderBG
      },
      headerTitleStyle: {
        color: currentTheme.newFontcolor,
      },
      headerLeft: () => (
        <HeaderBackButton
          truncatedLabel=''
          backImage={() => (
            <View style={styles(currentTheme).backButton}>
              <AntDesign name='arrowleft' size={scale(22)} color={currentTheme.newIconColor} />
            </View>
          )}
          onPress={() => navigationService.goBack()}
        />
      ),
    });
  }, [navigation, currentTheme, t]);

  const handleMallSelect = (mall) => {
    setSelectedMall(mall); // Save selected mall to context
    // Navigate to the main discovery/store browsing screen, which will now be filtered by this mall
    navigation.navigate('Discovery'); 
  };

  if (loading) {
    return (
      <View style={[styles(currentTheme).screenBase, styles(currentTheme).centerAlign]}>
        <ActivityIndicator size="large" color={currentTheme.iconColorPink} />
      </View>
    );
  }

  if (error) {
    console.error("Error fetching malls:", error);
    return <ErrorView text={t('Error fetching malls. Please try again.')} refetch={GET_MALLS} />;
  }

  const renderMallItem = ({ item }) => (
    <TouchableOpacity 
      style={styles(currentTheme).mallItemContainer}
      onPress={() => handleMallSelect(item)}
    >
      <TextDefault H5 bold textColor={currentTheme.fontMainColor}>{item.name}</TextDefault>
      <TextDefault textColor={currentTheme.fontSecondColor} Small>{item.address || t('Address not available')}</TextDefault>
      {/* Add mall image or icon here if available */}
    </TouchableOpacity>
  );

  return (
    <View style={styles(currentTheme).screenBase}>
      <FlatList
        data={data?.malls || []}
        renderItem={renderMallItem}
        keyExtractor={(item) => item._id}
        ListEmptyComponent={() => (
          <View style={styles(currentTheme).centerAlign}>
            <TextDefault textColor={currentTheme.fontMainColor}>{t('No malls available at the moment.')}</TextDefault>
          </View>
        )}
        contentContainerStyle={{ paddingBottom: inset.bottom + scale(20) }}
      />
    </View>
  );
}

export default MallSelectionScreen;

