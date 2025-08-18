import React from "react";
import Navbar from "../components/Navbar";

export default function Help() {
  return (
    <div>
      <Navbar />
      <div className="container">
        <div className="card">
          <h2>Help & Support</h2>
          <div className="row">
            <div className="card">
              <h3>Admin 1</h3>
              <p>Name: Dimpal Dewasi</p>
              <p>Email: dimpal.r.dewasi@gmail.com</p>
              <p>Anudip Student_ID: AF04954656</p>
            </div>
            <div className="card">
              <h3>Admin 2</h3>
              <p>Name: Sheetal Nilawar</p>
              <p>Email: sheetalnilawar12@gmail.com</p>
              <p>Anudip Student_ID: AF04954655</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
