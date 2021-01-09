import { SemanticCOLORS } from 'semantic-ui-react'

export function getColor(color: SemanticCOLORS) {
  switch (color) {
    case 'blue': 
        return '#2185d0';
    case 'yellow':
        return '#fbbd08';  
    default:
        return undefined;
  }
}