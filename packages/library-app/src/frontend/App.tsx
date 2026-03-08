import { ParentComponent } from 'solid-js';
import { A } from '@solidjs/router';

const App: ParentComponent = (props) => {
  return (
    <>
      <nav>
        <div class="brand">LibraryManager</div>
        <A href="/">Dashboard</A>
        <A href="/books">Books</A>
      </nav>
      <main>
        {props.children}
      </main>
    </>
  );
};

export default App;
