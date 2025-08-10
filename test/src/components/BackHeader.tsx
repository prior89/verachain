
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { NativeStackHeaderProps } from '@react-navigation/native-stack';

export default function BackHeader({ navigation, route, options }: NativeStackHeaderProps) {
  const title = options.title ?? route.name;
  return (
    <View style={{ flexDirection:'row', alignItems:'center', padding:12, borderBottomWidth:1, borderColor:'#eee', backgroundColor:'#fff' }}>
      <TouchableOpacity onPress={() => navigation.canGoBack() ? navigation.goBack() : navigation.navigate('Tabs' as never)}>
        <Text style={{ fontSize:16, color:'#6B4FE3' }}>◀ Back</Text>
      </TouchableOpacity>
      <Text style={{ marginLeft:12, fontSize:18, fontWeight:'700', color:'#111' }}>{title}</Text>
    </View>
  );
}
