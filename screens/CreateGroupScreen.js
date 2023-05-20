import { Image, StyleSheet, Text, TextInput, View, TouchableOpacity, Button, ScrollView } from 'react-native'
import React, { useEffect, useState } from 'react'
import { addDoc, collection, doc, getDoc, getDocs } from 'firebase/firestore'
import { auth, database } from '../firebase'
import { useNavigation } from '@react-navigation/native'
import CheckBox from 'expo-checkbox'

const CreateGroupScreen = () => {
    const user = auth.currentUser

    const [memberArray, setMemberArray] = useState([])
    const [searchArray, setSearchArray] = useState([])
    const [checkedMembers, setCheckedMembers] = useState([{name: user.displayName, id: user.uid, pfp: user.photoURL}])
    const [groupName, setGroupName] = useState("")
    const [searchValue, setSearchValue] = useState("")
    const [loading, setLoading] = useState(false);

    const navigation = useNavigation();

    const MemberComponent = (props) => {
      const [isSelected, setSelection] = useState(
        checkedMembers.length > 0 ? checkedMembers.indexOf(props.id) > -1 : false
      );

      function handleSelection(id, name, pfp) {
        if (isSelected == false) {
          setSelection(true);
          setCheckedMembers((oldArray) => [...oldArray, { name: name, id: id, pfp: pfp }]);
        } else {
          setSelection(false);
          setCheckedMembers((oldArray) => oldArray.filter((member) => member.id !== id));
        }
      }

      return (
        <>
          <TouchableOpacity
            style={styles.messageComponent}
            onPress={() => {
              handleSelection(props.id, props.name, props.img);
            }}
          >
            <Image
              source={props.img ? { uri: props.img } : require("../assets/icons/default_pfp.png")}
              style={styles.messageComponentImage}
            />
            <View style={styles.alignRight}>
              <View style={{ flexDirection: "column" }}>
                <Text style={styles.messageComponentText}>{props.name}</Text>
                <Text style={styles.usernameText}>{props.username}</Text>
              </View>
              <CheckBox value={isSelected} style={styles.checkbox} />
            </View>
          </TouchableOpacity>
        </>
      );
    };

    function handleSearch(value) {
      setSearchArray(memberArray.filter((member) => member.props.name.toLowerCase().includes(value)));
    }

    async function createGroup() {
      setLoading(true);
      const name = groupName;
      const creator = user.displayName;
      const members = checkedMembers;
      await addDoc(collection(database, "Groups"), {
        name,
        creator,
        members,
        messages: [],
      });
      navigation.navigate("Groups");
    }

    useEffect(() => {
      navigation.setOptions({
        headerRight: () => (
          <Button
            title={"Create"}
            // members include the current logged in user so the minimum is 2 checked members
            disabled={checkedMembers.length < 3 || groupName.length < 3 || loading}
            onPress={createGroup}
          />
        ),
      });
    }, [checkedMembers, groupName, loading]);

    useEffect(() => {
      // initializes the memberArray with all the users that the current user follows and that follow the current user
      const docRef = doc(database, "userInfo", user.uid);
      getDoc(docRef).then((res) => {
        var relationsArray = res.data().followers.concat(res.data().following).unique();
        getDocs(collection(database, "userInfo")).then((response) => {
          let tempArray = [];
          response.forEach((doc) => {
            if (doc.id != user.uid && relationsArray.includes(doc.id)) {
              tempArray.push(
                <MemberComponent
                  key={doc.id}
                  img={doc.data().pfp || null}
                  name={doc.data().name}
                  username={doc.data().username}
                  id={doc.id}
                />
              );
            }
          });
          setMemberArray(tempArray);
        });
      });
    }, []);

    return (
        <ScrollView>
            <View style={styles.container}>
                <TextInput
                    value={groupName}
                    onChangeText={text => setGroupName(text)}
                    placeholder="Group Name" 
                    style={styles.nameInput} 
                />
                {groupName.length<3 &&
                    <Text style={styles.redText}>At least 3 letters</Text>
                }
                <View style={styles.searchContainer}>
                    <Image source={require("../assets/icons/search.png")} style={styles.searchIcon} />
                    <TextInput
                        value={searchValue}
                        onChangeText={text => {
                            setSearchValue(text)
                            handleSearch(text)
                        }}
                        placeholder="Search"
                        style={styles.searchInput}
                    />
                </View>
            </View>
            <View>
                { 
                    searchValue.length > 0 ?
                    searchArray :
                    memberArray
                }
            </View>
        </ScrollView>
    )
}

export default CreateGroupScreen

const styles = StyleSheet.create({
    container: {
        alignItems: 'center',
        paddingTop: 30,
    },
    nameInput: {
        marginBottom: 15,
        borderBottomWidth: 1,
        borderBottomColor: 'black',
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 5,
        backgroundColor: 'lightgray',
        borderRadius: 10,
        marginTop: 10,
        marginBottom: 10,
    },
    searchIcon: {
        width: 20,
        height: 20
    },
    searchInput: {
        marginLeft: 3,
        marginBottom: 2,
        width: '90%',
    },
    messageComponent: {
        padding: 5,
        flexDirection: "row",
        alignItems: 'center',
        borderColor: 'grey',
        borderWidth: 1,
    },
    messageComponentImage: {
        width: 40,
        height: 40,
        marginRight: 10,
        borderRadius: 50
    },
    messageComponentText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    alignRight: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        width: '80%',
    },
    redText: {
        color: 'red',
        fontSize: 10,
    },
})

Array.prototype.unique = function () {
    var a = this.concat();
    for (var i = 0; i < a.length; ++i) {
        for (var j = i + 1; j < a.length; ++j) {
            if (a[i] === a[j])
                a.splice(j--, 1);
        }
    }

    return a;
};