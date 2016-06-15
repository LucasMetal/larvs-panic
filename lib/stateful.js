// Stateful is a simple implementation of the state pattern for javascript.
//
// Read more on this design pattern here:
// -> http://sourcemaking.com/design_patterns/state
//
// Initialize Stateful by passing it an object, the name of the initial state
// (defaults to "default"), and an optional hash of interfaces that will be
// applied for each state. If these interfaces are not passed, they default to
// the object's constructor's States property. So, for example:
//
// Example:
//
//     function TrafficLight() {
//       this.state = new Stateful(this, "stop");
//     }
//
//     TrafficLight.States = {
//       stop: {
//         color: "red",
//         time:  8,
//
//         next: function() {
//           this.state.transition("go");
//         },
//
//         onEnterState: function() {
//           // Turn on traffic camera to see who crosses on a red light
//         },
//
//         onExitState: function() {
//           // Turn off traffic camera
//         }
//       },
//
//       go: {
//         color: "green",
//         time:  10,
//
//         next: function() {
//           this.state.transition("caution");
//         }
//       },
//
//       caution: {
//         color: "yellow",
//         time:  2,
//
//         next:  function() {
//           this.state.transition("stop");
//         }
//       }
//     }
//
//     var light = new TrafficLight();
//     light.color //=> "red"
//     light.next()
//     light.color //=> "green"
//     light.next()
//     light.color //=> "yellow"
//     light.next()
//     light.color //=> "red"
//
// Each state interface can have "special" `onEnterState` / `onExitState`
// methods that get called automatically whenever you switch states.
//

function stateful(initialStateName, states, onTrigger, onInitialize) {
  var myStateful = {
        stateName : null,
        state : null
      };      

  if (typeof states == "undefined") {
    throw "An object with the set of interfaces for each state is required";
  }

  function trigger() {
    if (typeof onTrigger == "function") {
      onTrigger.apply(myStateful, arguments);
    }
  }

  function applyState(stateName) {
    var previousState = states[myStateful.stateName];
    var newState = states[stateName];

    if (typeof newState == "undefined") {
      throw "Invalid state: " + stateName;
    }

    if (previousState) {
      trigger("state:exit", myStateful.stateName);

      if (typeof previousState.onExitState == "function") {
        previousState.onExitState();
      }

/*
      for (property in previousInterface) {
        delete object[property];
      }
      delete object["onEnterState"];
      delete object["onExitState"];
*/
      trigger("state:exited", myStateful.stateName);
    }

    trigger("state:enter", stateName);

/*
    for (property in newInterface) {
      object[property] = newInterface[property]
    }
*/

    if (typeof newState.onEnterState == "function") {
      newState.onEnterState();
    }

    myStateful.state = newState;

    trigger("state:entered", stateName);
  }

  function transitionTo(stateName) {
    applyState(stateName);
    currentStateName = stateName;
    trigger("state:change");
  }

  function isCurrentState(stateName) {
    return currentStateName === stateName;
  }

  if (typeof onInitialize == "function") {
    onInitialize(object);
  }

  transitionTo(initialStateName || "default");

  myStateful.is = isCurrentState;
  myStateful.transition = transitionTo; 

  return myStateful;
}