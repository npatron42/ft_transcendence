import List from "./List"
import Buttont from "./Buttont"


function Tess() {
  return (
    <div>
      <h1>oui non</h1>
      <List />
      <List />
      <button onClick={() => console.log("clik")}> Click </button>
      <Buttont />
    </div>
  )
}

export default Tess
