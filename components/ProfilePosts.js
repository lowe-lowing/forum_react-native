import { Image, ScrollView, StyleSheet, Text, View } from 'react-native'
import React, { useContext, useEffect, useState } from 'react'
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { collection, getDocs, onSnapshot, orderBy, query, QuerySnapshot, where } from 'firebase/firestore';
import { database } from '../firebase';
import { useNavigation } from '@react-navigation/native';
import { HeightContext } from '../context/heightContext';

const Tab = createMaterialTopTabNavigator();

const ProfilePosts = (id) => {
  return ( 
      <Tab.Navigator
        initialRouteName="GridView"
        screenOptions={{
          tabBarActiveTintColor: '#e91e63',
          tabBarLabelStyle: { fontSize: 12 },
          activeTintColor: '#0000000',
        }}
      >
        <Tab.Screen
          name="GridView"
          component={GridViewScreen}
          initialParams={{id: id}}
          options={{ 
            tabBarIcon: ({focused, color}) => (
              <Image style={styles.tabBarIcon} source={require("../assets/icons/4xgrid.png")}/>
            ),
            tabBarShowIcon: true,
            tabBarShowLabel: false,
          }}
        />
        <Tab.Screen
          name="TaggedPosts"
          component={TaggedPostsScreen}
          options={{
            tabBarIcon: ({focused, color}) => (
              <Image style={styles.tabBarIcon} source={require("../assets/icons/user-tagged.png")}/>
            ),
            tabBarShowIcon: true,
            tabBarShowLabel: false,
          }}
        />
      </Tab.Navigator>
  )
} 

const GridViewScreen = ({route}) => {
  const [gridView, setGridView] = useState()
  const {value, setValue} = useContext(HeightContext) 

  const navigation = useNavigation()

  function getPosts() {
    const q = query(
      collection(database, "Posts"),
      where("authorId", "==", route.params.id),
      orderBy("createdAt", 'desc')
    )
    getDocs(q).then((data) => {
      let tempArray = []
      let tempArray2 = []
      let postArray = []
      let i = 1;
      data.forEach(post => {
        const fields = post._document.data.value.mapValue.fields
        tempArray.push({message: fields.message.stringValue, photoURL: fields.imageUrl?fields.imageUrl.stringValue: undefined})
        if (i%3==0) {
          tempArray2.push(tempArray)
          tempArray = []
        }
        i++
      })
      if ((i-1)%3==1 || (i-1)%3==2) { // length
        tempArray2.push(tempArray)
        tempArray = []
      }
      setValue(tempArray2.length*100 + 200)
      tempArray2.forEach((element, i) => {
        postArray.push(
          <View key={i} style={styles.row}> 
            {element[0]!=undefined &&
            <View style={element[1]!=undefined ? styles.column: styles.solo}>
              {element[0].photoURL!=undefined ?
              <Image source={{uri: element[0].photoURL}} style={styles.postImage}/> :
              <Text style={styles.postText}>{element[0].message}</Text>}
            </View>}
            {element[1]!=undefined &&
            <View style={styles.column}>
              {element[1].photoURL!=undefined ?
              <Image source={{uri: element[1].photoURL}} style={styles.postImage}/> :
              <Text style={styles.postText}>{element[1].message}</Text>}
            </View>}
            <View style={element[2]!=undefined ? styles.column: styles.bolo}>
              {element[2]!=undefined ? element[2].photoURL!=undefined ? 
              <Image source={{uri: element[2].photoURL}} style={styles.postImage}/> :
              <Text style={styles.postText}>{element[2]!=undefined ? element[2].message:""}</Text> : 
              <Text style={styles.postText}>{element[2]!=undefined ? element[2].message:""}</Text>}
            </View>
          </View>
        )
      });
      setGridView(postArray)
    });
  }

  useEffect(() => {
    navigation.addListener('focus', () => {
      getPosts()
    });
  }, [])

  return (
    <>
      {gridView}
    </>
  )
} 
const TaggedPostsScreen = () => {
    return (
        <View>
            <Text>settings</Text>
        </View>
    )
} 

export default ProfilePosts

const styles = StyleSheet.create({
  tabBarIcon: {
    width: 30,
    height: 30
  },
  gridView: {
    flexDirection: 'row',
    flex: 1,
    maxHeight: 100,
  },
  row: {
    flex: 1, 
    flexDirection: "row", 
    maxHeight: 100 
  },
  column: {
    flex: 1, 
    borderWidth: 2,
    borderColor: "lightgray"
  },
  solo: {
    width: '33%',
    borderWidth: 1,
    borderColor: "lightgray"
  },
  bolo: {
    flex: 1,
  },
  postImage: {
    width: '100%',
    height: '100%',
  },
  postText: {
    margin: 10,
    fontSize: 16,
  }
})