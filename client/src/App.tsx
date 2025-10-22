import { Toaster } from "@/components/ui/sonner"
import { TooltipProvider } from "@/components/ui/tooltip"
import NotFound from "@/pages/NotFound"
import { Route, Switch } from "wouter"
import ErrorBoundary from "./components/ErrorBoundary"
import { ThemeProvider } from "./contexts/ThemeContext"
import Home from "./pages/Home"
import About from "./pages/About"
import Posts from "./pages/Posts"
import PostDetail from "./pages/PostDetail"
import Archive from "./pages/Archive"
import Contact from "./pages/Contact"
import AdminLogin from "./pages/AdminLogin"
import AdminDashboard from "./pages/AdminDashboard"
import AdminPostEditor from "./pages/AdminPostEditor"
import AdminReviewEditor from "./pages/AdminReviewEditor"
import Books from "./pages/Books"
import Films from "./pages/Films"
import Audio from "./pages/Audio"
import Video from "./pages/Video"
import { QueryClientProvider, QueryClient } from "react-query"

const queryClient = new QueryClient()

function Router() {
  return (
    <Switch>
      <Route path="/" component={Home} />
      <Route path="/about" component={About} />
      <Route path="/posts" component={Posts} />
      <Route path="/posts/:slug" component={PostDetail} />
      <Route path="/archive" component={Archive} />
      <Route path="/contact" component={Contact} />
      <Route path="/admin" component={AdminLogin} />
      <Route path="/admin/dashboard" component={AdminDashboard} />
      <Route path="/admin/posts/new" component={AdminPostEditor} />
      <Route path="/admin/posts/:id" component={AdminPostEditor} />
      <Route path="/admin/reviews/new" component={AdminReviewEditor} />
      <Route path="/admin/reviews/:id" component={AdminReviewEditor} />
      <Route path="/books" component={Books} />
      <Route path="/films" component={Films} />
      <Route path="/audio" component={Audio} />
      <Route path="/video" component={Video} />
      <Route component={NotFound} />
    </Switch>
  )
}

function App() {
  return (
    <ThemeProvider defaultTheme="dark">
      <ErrorBoundary>
        <QueryClientProvider client={queryClient}>
          <TooltipProvider>
            <Router />
            <Toaster />
          </TooltipProvider>
        </QueryClientProvider>
      </ErrorBoundary>
    </ThemeProvider>
  )
}

export default App
