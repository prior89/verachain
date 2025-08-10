
import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
export default function Filters({ value, onChange, options }:{ value:string; onChange:(v:any)=>void; options:{label:string,value:string}[] }) {
  return (
    <View style={{ flexDirection:'row', gap:8, marginBottom:10 }}>
      {options.map(opt=>(
        <TouchableOpacity key={opt.value} onPress={()=>onChange(opt.value)} style={{ paddingHorizontal:10, paddingVertical:6, borderRadius:10, backgroundColor: value===opt.value ? '#6B4FE3' : '#eee' }}>
          <Text style={{ color: value===opt.value ? '#fff' : '#222', fontWeight:'700' }}>{opt.label}</Text>
        </TouchableOpacity>
      ))}
    </View>
  );
}
