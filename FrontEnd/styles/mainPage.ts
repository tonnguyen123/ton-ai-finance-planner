import { Dimensions, StyleSheet } from "react-native";

const screenWidth = Dimensions.get('window').width;
const screenHeight = Dimensions.get('window').height;
const buttonWidth = screenWidth * 0.4;
const buttonHeight = screenHeight * 0.12;

export const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'white',
  },

  title: {
    fontSize: 22,
    color: 'blue',
    marginBottom: 20,
    marginTop: 50,
    alignSelf: 'center',
  },

  buttonGroup: {
    marginTop: 50,
    justifyContent: 'center',
    alignItems: 'center',
    flexDirection: 'row',
    flexWrap: 'wrap',
  },

  buttonSpacing: {
    backgroundColor: '#007AFF',
    margin: 8,
    width: buttonWidth,
    height: buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

  buttonText: {
    fontSize: 18,
    color: 'white',
    fontWeight: 'bold',
  },


  docButton:{
    backgroundColor: 'green',
    margin: 8,
    width: buttonWidth,
    height: buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },
  emailbutton:{
    backgroundColor: 'red',
    margin: 8,
    width: buttonWidth,
    height: buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,

  },
  notesButton:{

    backgroundColor: 'yellow',
    margin: 8,
    width: buttonWidth,
    height: buttonHeight,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: 10,
  },

});
