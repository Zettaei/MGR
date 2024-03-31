import { ErrorBoundary, Show, lazy } from 'solid-js';
import { Router, Route } from "@solidjs/router";
import user from "./global/currentUser";
const Login = lazy(() => import('./components/Login/Login'));
const Register = lazy(() => import('./components/Register/Register'));
const Home = lazy(() => import('./components/Home/Home'));
const Search = lazy(() => import('./components/Search/Search'));
const Navbar = lazy(() => import('./components/Navbar'));
const BasicError = lazy(() => import('./components/Error/BasicError'));
const GamePage = lazy(() => import('./components/GamePage/GamePage'));
const UserRecordList = lazy(() => import('./components/UserRecord/UserRecordList'));
const Settings = lazy(() => import('./components/SettingsPage/Settings'));
const SearchUser = lazy(() => import('./components/SearchUser/SearchUser'));
const ReviewPage = lazy(() => import('./components/ReviewPage/ReviewPage'));
const UserProfile = lazy(() => import('./components/UserProfile/UserProfile'));
const UserReviewPage = lazy(() => import('./components/ReviewPage/UserReviewsPage'));


function App() {

  return (
    <>
      <ErrorBoundary fallback={(err) => {
        return <pre className='m-4 text-start h4'>{err.message}</pre>
      }
      }>
        <Router >
        
          <Route path="/" component={() => <Navbar><Home /></Navbar>} />
          <Show when={user.currentUser().username && user.currentUser().tag} fallback={
            <>
              <Route path="/login" component={() => <Navbar><Login /></Navbar>} />
              <Route path="/register" component={() => <Navbar><Register /></Navbar>} />
            </>
          }>
            <>
              <Route path="/settings" component={() => <Navbar><Settings /></Navbar>} />
            </>
          </Show>
          <Route path="/game/:id" component={() => <Navbar><GamePage /></Navbar>} />
          <Route path="/game/:id/reviews/:page?" component={() => <Navbar><GamePage /></Navbar>} />
          <Route path="/review/:id" component={() => <ReviewPage />} />
          <Route path="/search/:keyword?/:page?" component={() => <Navbar><Search /></Navbar>} />
          <Route path="/record/:usernameWithTag" component={() => <Navbar><UserRecordList /></Navbar>} />
          <Route path="/searchUser" component={() => <Navbar><SearchUser /></Navbar>} />
          <Route path="/user/:usernameWithTag/" component={() => <Navbar><UserProfile /></Navbar>} />
          <Route path="/user/:usernameWithTag/reviews" component={() => <Navbar><UserReviewPage /></Navbar>} />
          <Route path="*404" component={() => {
            return <BasicError title="404 NOT FOUND" message="The page does not exist" />
          }} />
        </Router>

      </ErrorBoundary>
    </>
  )
}

export default App;
