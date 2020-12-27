import React, { ReactNode } from 'react';
import { Entity } from './types';

// import './icons.css';
import { contain_key } from './utils';

const fruit_style = {
  height: "auto",
  width: "1.0em",
};

export const FRUITS: ReactNode[]= [
  "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/tomato_1f345.png",
  "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/lemon_1f34b.png",
  "https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/google/263/green-apple_1f34f.png",
].map(src => <img src={src} style={fruit_style} />);

export const shield_icon = <img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/259/shield_1f6e1.png" style={fruit_style} />;

export const skip_icon = <img src="https://emojipedia-us.s3.dualstack.us-west-1.amazonaws.com/thumbs/240/twitter/259/running-shoe_1f45f.png" style={fruit_style} />;

export function get_entity_icon(entity: Entity): ReactNode {
  if (typeof entity == "object") {
    return FRUITS[entity.fruit];
  }
  else if (entity == "shield") {
    return shield_icon;
  }
  else {
    return skip_icon;
  }
}