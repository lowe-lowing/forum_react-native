import { Button, StyleSheet, Text, View } from 'react-native'
import React from 'react'
import { useNavigation } from '@react-navigation/native'

const PrivateMessageScreen = () => {
  const navigation = useNavigation()
  return (
    <View>
      <Text>PrivateMessageScreen</Text>
      <Button onPress={() =>{navigation.navigate("Private Message Component", {id: "aMLVCydFM6SMORxzcZ65duNQ4Jl1"})}} title="bruh"/>
    </View>
  )
}

export default PrivateMessageScreen

const styles = StyleSheet.create({})