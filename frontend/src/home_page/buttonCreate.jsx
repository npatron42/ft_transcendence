import List from "./List"
import Button from 'react-bootstrap/Button';
import "./button.css"


function buttonCreate() {
  return (
    <div>
    <Button size="sm" className="custom-button">Créer un compte</Button>
  </div>
  );
}

export default buttonCreate;
