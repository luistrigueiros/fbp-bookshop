import { ParentComponent } from 'solid-js';
import { A } from '@solidjs/router';

const App: ParentComponent = (props) => {
  return (
    <>
      <nav>
        <div class="brand">LibraryManager</div>
        <A href="/">Dashboard</A>
        <A href="/books">Books</A>
        <A href="/publishers">Publishers</A>
        <A href="/genders">Genders</A>
      </nav>
      <main>
        {props.children}
      </main>
    </>
  );
};

export default App;
