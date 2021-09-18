import { memo } from 'react';

import Video from './Video/Video';
import styles from './grid-user.module.css';

function Gridusers(props) {
    return (
        <div className={styles.grid}>
            {props.streams.map((stream, index) => {
                return (
                    <Video 
                        key={index} 
                        index={index}
                        stream={stream} 
                        controls={props.controls} 
                        users={props.users}
                        length={props.streams.length}
                    />
                )
            })}
        </div>
    )
}

export default memo(Gridusers);