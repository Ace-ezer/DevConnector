/* eslint-disable react-hooks/exhaustive-deps */
import React  from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import{ Link } from 'react-router-dom';
import Moment from 'react-moment';
import { deleteComment } from '../../actions/post';


const CommentItem = ({
    postId , 
    comment: {
        _id,
        text,
        name,
        avatar,
        user,
        date
    } ,
    auth,
    deleteComment
    }) => {
           

    return(
        <div class="post bg-white p-1 my-1">
            <div>
                <Link to={'/profile/'+user}>
                <img
                    class="round-img"
                    src={avatar}
                    alt="" />
                <h4>{name}</h4>
                </Link>
            </div>
            <div>
                <p class="my-1">
                {text}
                </p>
                <p class="post-date">
                    Posted on <Moment format='YYYY/MM/DD'>{date}</Moment>
                </p>
                { !auth.loading && user === auth.user._id  && (
                    <button      
                    type="button"
                    class="btn btn-danger"
                    onClick={e => deleteComment(postId , _id)}
                    >
                    <i class="fas fa-trash"></i>{' '}
                    Delete
                    </button>
                )}
            </div>
        </div>
    );
}

CommentItem.propTypes = {
    postId: PropTypes.number.isRequired,
    comment: PropTypes.object.isRequired,
    deleteComment: PropTypes.func.isRequired,
    auth: PropTypes.object.isRequired
}

const mapStateToProps = state => ({
    auth: state.auth
})

export default connect( mapStateToProps , { deleteComment } )(CommentItem);