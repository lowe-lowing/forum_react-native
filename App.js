import { StatusBar } from 'expo-status-bar';
import { Button, Image, LogBox, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { auth, database } from './firebase'
import { createContext, useContext, useEffect, useState } from 'react';
import { onAuthStateChanged, signOut } from "firebase/auth";
import HomeScreen from './screens/HomeScreen';
import LoginScreen from './screens/LoginScreen';
import ForgotPwd from './screens/ForgotPwdScreen';
import PostScreen from './screens/PostScreen';
import GroupScreen from './screens/GroupScreen';
import PrivateMessageScreen from './screens/PrivateMessageScreen';
import ProfileScreen from './screens/ProfileScreen';
import RegisterScreen from './screens/RegisterScreen';
import CommentScreen from './screens/CommentScreen';
import EditProfileScreen from './screens/EditProfileScreen';
import MemberProfileScreen from './screens/MemberProfileScreen';
import PrivateMessageComponent from './components/PrivateMessageComponent';
import SearchScreen from './screens/SearchScreen';
import CreateGroupScreen from './screens/CreateGroupScreen';
import GroupRoomScreen from './screens/GroupRoomScreen';
import { doc, getDoc } from 'firebase/firestore';

const LoginStack = createNativeStackNavigator();
const Tab = createBottomTabNavigator();
const Stack = createNativeStackNavigator()
const HomeStack = createNativeStackNavigator();
const SearchStack = createNativeStackNavigator();
const GroupStack = createNativeStackNavigator();
const PrivateMessageStack = createNativeStackNavigator();
const ProfileStack = createNativeStackNavigator();

const HomeStackScreen = () => (
  <HomeStack.Navigator>
    <HomeStack.Screen name="Feed" component={HomeScreen} 
      options={({ navigation }) => ({ 
        headerRight: () => (
          <Button title="Post"
            onPress={() => {
              navigation.navigate("New Post")
            }}
          />
      ),})}/>
    <HomeStack.Screen name="New Post" component={PostScreen}/>
    <HomeStack.Screen name="Comments" component={CommentScreen}/>
    <HomeStack.Screen name="Member Profile" component={MemberProfileScreen}/>
  </HomeStack.Navigator>
)
const SearchStackScreen = () => (
  <SearchStack.Navigator>
    <SearchStack.Screen name="Search" component={SearchScreen}/>
    <SearchStack.Screen name="Member Profile" component={MemberProfileScreen}/>
  </SearchStack.Navigator>
)
const GroupStackScreen = () => (
  <GroupStack.Navigator>
    <GroupStack.Screen name="Groups" component={GroupScreen}
      options={({ navigation }) => ({ 
        headerRight: () => (
          <Button title="Create Group"
            onPress={() => {
              navigation.navigate("Create Group")
            }}
          />
      ),})}/>
    <GroupStack.Screen name="Create Group" component={CreateGroupScreen}/>
    <GroupStack.Screen name="Group Room" component={GroupRoomScreen}/>
  </GroupStack.Navigator>
)
const PrivateMessageStackScreen = () => (
  <PrivateMessageStack.Navigator>
    <PrivateMessageStack.Screen name="Private Messages" component={PrivateMessageScreen}/>
    <PrivateMessageStack.Screen name="post" component={HomeScreen}/>
  </PrivateMessageStack.Navigator>
)
const ProfileStackScreen = () => (
  <ProfileStack.Navigator>
    <ProfileStack.Screen name={"Profile Screen"} component={ProfileScreen}
    options={() => ({
      headerRight: () => (
        <Button title="Sign Out"
          onPress={() => {
            signOut(auth).then(() => {console.log("signed out");}).catch((err) => console.log(err))
          }}
        />
    ),})}/>
    <ProfileStack.Screen name="Edit Profile" component={EditProfileScreen}/>
  </ProfileStack.Navigator>
)

function MainTabs() {
  const user = auth.currentUser
  return (
    <Tab.Navigator
      screenOptions={{
        "tabBarActiveBackgroundColor": 'cyan',
        "tabBarShowLabel": false,
        "headerShown": false,
        "tabBarActiveTintColor": "red",
        "tabBarStyle": [
          {
            "display": "flex"
          },
          null
        ]
      }}>
      <Tab.Screen name="Home Tab" component={HomeStackScreen}
        options={{
          tabBarIcon: () => (<Image source={require("./assets/icons/home.png")} style={{width: 20, height: 20}} />)
        }}
      />
      <Tab.Screen name="Search Tab" component={SearchStackScreen}
        options={{
          tabBarIcon: () => (<Image source={require("./assets/icons/search.png")} style={{width: 20, height: 20}} />)
        }}
      />
      <Tab.Screen name="Groups Tab" component={GroupStackScreen}
        options={{
          tabBarIcon: () => (<Image source={require("./assets/icons/group.png")} style={{width: 20, height: 20}} />)
        }}
      />
      <Tab.Screen name="Private Messages Tab" component={PrivateMessageStackScreen}
        options={{
          tabBarIcon: () => (<Image source={require("./assets/icons/messages.png")} style={{width: 20, height: 20}} />)
        }}
      />
      <Tab.Screen name="Profile Tab" component={ProfileStackScreen}
        options={{
          tabBarIcon: () => (<Image source={user.photoURL?{uri:user.photoURL}:require("./assets/icons/profile.png")} style={{width: 20, height: 20, borderRadius: 50}} />)
        }}
      />
    </Tab.Navigator>
  );
}
export default function App() {
  const [loggedIn, setLoggedIn] = useState(false)

  useEffect(() => {
      // const unsubscribe = () => {
        onAuthStateChanged(auth, user => {
          if (user) {
            setLoggedIn(true);
          }
          else {
            setLoggedIn(false);
          }
        });
      // }
      // return unsubscribe
  }, [])
  return (
    <NavigationContainer style={styles.container}>
      {loggedIn ?
      <Stack.Navigator>
        <Stack.Screen options={{headerShown: false}} name="Main" component={MainTabs} />
        <Stack.Screen name="Private Message Component" component={PrivateMessageComponent}/>
      </Stack.Navigator> :
      <LoginStack.Navigator>
        <LoginStack.Screen name="Login" component={LoginScreen}/>
        <LoginStack.Screen name="Register" component={RegisterScreen}/>
        <LoginStack.Screen name="Forgot Password" component={ForgotPwd}/>
      </LoginStack.Navigator>
      }
    </NavigationContainer>
  );
}
const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#fff',
    alignItems: 'center',
    justifyContent: 'center',
  },
});
