import React from 'react';
import { CSSTransition, TransitionGroup } from 'react-transition-group';

const TaskAnimation = ({ children, timeout = 300 }) => {
    return (
        <TransitionGroup>
            <CSSTransition
                key={children.key}
                timeout={timeout}
                classNames="task"
            >
                {children}
            </CSSTransition>
        </TransitionGroup>
    );
};

export default TaskAnimation;