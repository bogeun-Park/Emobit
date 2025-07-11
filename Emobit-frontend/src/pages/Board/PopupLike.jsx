import '../../styles/PopupLike.css';
import { X } from 'lucide-react';

function PopupLike({ senders, handleMoveProfile, setShowLikePopup }) {
    return (
        <div className="popup-like-overlay" onClick={() => setShowLikePopup(false)}>
            <div className="popup-like" onClick={e => e.stopPropagation()}>
                <h3>좋아요</h3>
                <div className="close-button" onClick={() => setShowLikePopup(false)}>
                    <X size={26} color="#000" />
                </div>

                <ul>
                    {senders.map(member => (
                        <li key={member.id} className="like-member-item">
                            <div className="member-info">
                                <img
                                    src={member.imageUrl}
                                    alt={member.username}
                                    onClick={() => handleMoveProfile(member.username)}
                                />
                                <div className="member-wrapper" onClick={() => handleMoveProfile(member.username)}>
                                    <span className="member-username">{member.username}</span>
                                    <span className="member-displayName">{member.displayName}</span>
                                </div>
                            </div>
                            <button className="follow-button">팔로우</button>
                        </li>
                    ))}
                </ul>
            </div>
        </div>
    );
}

export default PopupLike;