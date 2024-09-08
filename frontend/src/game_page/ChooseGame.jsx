import React, { useState, useEffect } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import './css/chooseGame.css';

const ChooseGame = () => {

    return (
        <div id="ChooseGame">
            <div className="Solo">
            <a id="SoloButton" href="GlobalGameSolo">Solo</a>
            </div>
            <div className ="Multi">
            <a id="MultiButton" href="GlobalGameMulti">Multi</a>
            </div>
        </div>
    );
};

export default ChooseGame;
