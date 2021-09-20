import { useSelector } from 'react-redux';
import { Route, Switch, Redirect, useParams } from 'react-router-dom';

import Index from './pages/index/index';
import Meet from './pages/meet/meet';

function App() {
  return (
    <Switch>
      <Route path="/" exact>
        <Index/>
      </Route>
      <Route path="/:roomid" exact>
        <Index/>
      </Route>
      <Route path="/meet/:roomid" exact>
        <Routemeet/>
      </Route>
      <Route path="*">
        <Redirect to="/"/>
      </Route>
    </Switch>
  )
}

function Routemeet() {
  const routemeet = useSelector(state => state.manage.route_meet);
  const params = useParams();

  return (
    <>
    {!routemeet && <Redirect to={'/'+ params.roomid}/>}
    {routemeet && <Meet/>}
    </>
  )
}

export default App;