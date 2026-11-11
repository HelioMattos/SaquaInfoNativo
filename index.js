const React = require('react');
const { AppRegistry, ScrollView, Text, View } = require('react-native');

function esconderLogo() {
  try {
    require('expo-splash-screen').hideAsync();
  } catch (erro) {
    // A primeira tela já fica visível.
  }
}

function textoDoErro(erro) {
  if (!erro) return 'Erro desconhecido';
  if (erro.stack) return String(erro.stack);
  return String(erro.message || erro);
}

function TelaErro({ texto }) {
  return React.createElement(
    ScrollView,
    { style: { flex: 1, backgroundColor: '#fff' }, contentContainerStyle: { padding: 24 } },
    React.createElement(Text, { selectable: true, style: { color: '#111', fontSize: 16 } }, texto)
  );
}

class Cerca extends React.Component {
  state = { erro: null };

  componentDidCatch(erro) {
    esconderLogo();
    this.setState({ erro });
  }

  render() {
    if (this.state.erro) return React.createElement(TelaErro, { texto: textoDoErro(this.state.erro) });
    return this.props.children;
  }
}

function Root() {
  const [App, setApp] = React.useState(null);
  const [erro, setErro] = React.useState('');

  React.useEffect(() => {
    esconderLogo();
    try {
      require('react-native-gesture-handler');
      require('@expo/metro-runtime');
      const modulo = require('expo-router/build/qualified-entry');
      setApp(() => modulo.App);
    } catch (falha) {
      setErro(textoDoErro(falha));
    }
  }, []);

  if (erro) return React.createElement(TelaErro, { texto: erro });

  if (!App) {
    return React.createElement(
      View,
      {
        style: {
          flex: 1,
          backgroundColor: '#007bff',
          alignItems: 'center',
          justifyContent: 'center',
          padding: 24,
        },
      },
      React.createElement(
        Text,
        { style: { color: '#fff', fontSize: 22, fontWeight: 'bold', textAlign: 'center' } },
        'Abrindo SaquaInfo...'
      )
    );
  }

  return React.createElement(Cerca, null, React.createElement(App, null));
}

AppRegistry.registerComponent('main', () => Root);
