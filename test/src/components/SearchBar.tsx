
import React from 'react';
import { View, TextInput } from 'react-native';
export default function SearchBar({ value, onChange, placeholder }:{ value:string; onChange:(v:string)=>void; placeholder?:string }) {
  return (
    <View style={{ borderWidth:1, borderColor:'#ddd', borderRadius:12, paddingHorizontal:12, paddingVertical:8, marginBottom:10, backgroundColor:'#fff' }}>
      <TextInput value={value} onChangeText={onChange} placeholder={placeholder} />
    </View>
  );
}
