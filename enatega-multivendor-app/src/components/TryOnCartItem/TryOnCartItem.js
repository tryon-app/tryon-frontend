import React, { useContext } from 'react';
import { View, TouchableOpacity, Image } from 'react-native';
import { AntDesign } from '@expo/vector-icons';
import TextDefault from '../Text/TextDefault/TextDefault';
import styles from './styles'; // Create this file
import ThemeContext from '../../ui/ThemeContext/ThemeContext';
import ConfigurationContext from '../../context/Configuration';
import { scale } from '../../utils/scaling';
import { useTranslation } from 'react-i18next';

const TryOnCartItem = ({ item, onRemove }) => {
  const themeContext = useContext(ThemeContext);
  const configuration = useContext(ConfigurationContext);
  const { t } = useTranslation();
  const currentTheme = themeContext.ThemeValue;

  if (!item) {
    return null;
  }

  return (
    <View style={styles(currentTheme).container}>
      <View style={styles(currentTheme).leftContainer}>
        {item.image ? (
          <Image source={{ uri: item.image }} style={styles(currentTheme).image} />
        ) : (
          <View style={styles(currentTheme).imagePlaceholder} />
        )}
        <View style={styles(currentTheme).infoContainer}>
          <TextDefault H5 bold textColor={currentTheme.fontMainColor}>
            {item.name}
          </TextDefault>
          <TextDefault textColor={currentTheme.fontSecondColor} Small>
            {t('Size')}: {item.size}, {t('Color')}: {item.color}
          </TextDefault>
          <TextDefault textColor={currentTheme.fontSecondColor} Small>
            {t('Store')}: {item.storeName || t('N/A')}
          </TextDefault>
          {/* Display price if needed, though for TryOn it might not be primary focus here */}
          {/* <TextDefault H6 bold textColor={currentTheme.fontMainColor}>
            {configuration.currencySymbol}{parseFloat(item.price).toFixed(2)}
          </TextDefault> */}
        </View>
      </View>
      <View style={styles(currentTheme).rightContainer}>
        <TouchableOpacity onPress={onRemove} style={styles(currentTheme).removeButton}>
          <AntDesign name="closecircleo" size={scale(20)} color={currentTheme.textErrorColor} />
        </TouchableOpacity>
      </View>
    </View>
  );
};

export default TryOnCartItem;

