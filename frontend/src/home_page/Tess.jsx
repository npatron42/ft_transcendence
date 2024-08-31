import List from "./List"
import Buttont from "./Buttont"
import Button from 'react-bootstrap/Button';
import MultipleInputsExample from "./MultipleInputExample";



function Tess() {
  return (
    <div>
      <h1>oui non</h1>
      <List />
      <List />
      <button variant="warning"> bouton</button>
     <Button as="input" type="button" value="Input" />{' '}
  <input class="btn btn-primary" type="button" value="Input"></input>
    <MultipleInputsExample />
    </div>
  )
}

export default Tess
