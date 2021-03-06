// @flow
import React from 'react';
import type { Node } from 'react';
import {
	Button,
	Comment,
	Container,
	Divider,
	Header,
	Segment,
	Placeholder,
	Popup,
	Message,
	Label,
	Icon,
} from 'semantic-ui-react';

import { getComments, getPost, getReactions, replyTo } from '../../actions/postAction';
import { submitComment, submitReaction } from '../../actions/submitAction';
import { withRouter } from 'react-router-dom';
import { connect } from 'react-redux';
import { t } from 'i18next';
import SubmitForm from '../../component/submitForm/SubmitForm';
import {
	COMMENT_SUBMITTED,
	GET_COMMENTS,
	GET_POST,
	REACTION_REACTED,
} from '../../actions/actionType';

const ReactMarkdown = React.lazy(() => import('react-markdown'));

import type { PostState } from '../../reducers/post';
import type { AuthState } from '../../reducers/auth';
import type { AccountState } from '../../reducers/account';

const NavigationBar = React.lazy(() =>
	import('../../containers/navigationBar/NavigationBar'),
);
const CommentSection = React.lazy(() =>
	import('../../containers/commentSection/CommentSection'),
);

type Props = {
	auth: AuthState,
	account: AccountState,
	post: PostState,
	getPost: (string) => any,
	getComments: (string) => any,
	getReactions: (string) => any,
	replyTo: (number) => any,
	submitComment: (Object) => any,
	submitReaction: (Object) => any,
	match: { params: { id: string } },
};

type State = {
	submitting: boolean,
	reacted: boolean,
	reaction: string,
};

const REACT_UP = 'up';
const REACT_DOWN = 'down';
const REACT_LOL = 'lol';

class Post extends React.Component<Props, State> {
	state = {
		submitting: false,
		reacted: false,
		reaction: '',
	};

	async componentDidMount() {
		const id = this.props.match.params.id;
		const postRes = await this.props.getPost(id);

		if (postRes.type !== GET_POST) {
			return;
		}

		const commentRes = await this.props.getComments(id);

		if (commentRes.type !== GET_COMMENTS) {
			return;
		}

		this.props.getReactions(id);
	}

	getPlaceholderContent(): Node {
		const placeholderContent = (
			<Placeholder>
				<Placeholder.Paragraph>
					<Placeholder.Image rectangular />
				</Placeholder.Paragraph>
			</Placeholder>
		);

		return (
			<React.Fragment>
				{placeholderContent}

				<Comment.Group>
					<Header as="h3" dividing>
						{t('comments')}
					</Header>

					{placeholderContent}
				</Comment.Group>
			</React.Fragment>
		);
	}

	reactPost(reaction: string) {
		const { auth, account, post } = this.props;

		if (
			!auth.isAuth ||
			!post.reactions ||
			(post.currentPost && account.user === post.currentPost.userId)
		) {
			return;
		}

		this.setState(
			{
				reacted: true,
				reaction,
			},
			async () => {
				const response = await this.props.submitReaction({
					postId: this.props.match.params.id,
					reaction,
				});

				if (response.type !== REACTION_REACTED) {
					return;
				}

				this.props.getReactions(this.props.match.params.id);
				this.setState({
					reacted: false,
				});
			},
		);
	}

	getReactionButtons(): Node {
		const { currentPost, reactions } = this.props.post;

		if (!currentPost || !reactions) {
			return (
				<Placeholder style={{ height: 40, width: 200 }}>
					<Placeholder.Image />
				</Placeholder>
			);
		}

		let reacted = null,
			disabledUp = false,
			disableDown = false,
			disableLOL = false;

		for (const reactInfo of reactions) {
			if (reactInfo.userId === this.props.account.user) {
				reacted = reactInfo.reaction;
				break;
			}
		}

		switch (reacted) {
			case REACT_UP:
				disabledUp = true;
				break;
			case REACT_DOWN:
				disableDown = true;
				break;
			case REACT_LOL:
				disableLOL = true;
				break;
			default:
				break;
		}

		return (
			<React.Fragment>
				<Popup
					trigger={
						<Button
							color="green"
							icon="arrow alternate circle up outline"
							label={{
								basic: true,
								color: 'green',
								pointing: 'left',
								content:
									currentPost.up +
									(this.state.reaction === REACT_UP ? 1 : 0),
							}}
							disabled={disabledUp || this.state.reacted}
							onClick={() => {
								this.reactPost(REACT_UP);
							}}
						/>
					}
					content={t(REACT_UP)}
				/>

				<Popup
					trigger={
						<Button
							color="red"
							icon="arrow alternate circle down outline"
							label={{
								basic: true,
								color: 'red',
								pointing: 'left',
								content:
									currentPost.down +
									(this.state.reaction === REACT_DOWN
										? 1
										: 0),
							}}
							disabled={disableDown || this.state.reacted}
							onClick={() => {
								this.reactPost(REACT_DOWN);
							}}
						/>
					}
					content={t(REACT_DOWN)}
				/>

				<Popup
					trigger={
						<Button
							color="black"
							icon="loading child"
							label={{
								basic: true,
								color: 'black',
								pointing: 'left',
								content:
									currentPost.lol +
									(this.state.reaction === REACT_LOL ? 1 : 0),
							}}
							disabled={disableLOL || this.state.reacted}
							onClick={() => {
								this.reactPost(REACT_LOL);
							}}
						/>
					}
					content={t(REACT_LOL)}
				/>
			</React.Fragment>
		);
	}

	getContent(): Node {
		const { currentPost, comments, replyTo } = this.props.post;

		if (!currentPost) {
			return this.getPlaceholderContent();
		}

		const markdown = currentPost.content;
		const MarkdownComponent: any = ReactMarkdown;

		return (
			<React.Fragment>
				<Container textAlign="left">
					<Label color={'teal'} size={'large'}>
						{`${t('b/')} ${t(`${currentPost.board}Board`)}.   ${t('postBy')}  ${currentPost.userId}`}
						</Label>
				</Container>
				<Header as="h1">{currentPost.title}</Header>
				<Container>
					<Container
						textAlign="justified"
						style={{ overflowX: 'auto' }}
					>
						<MarkdownComponent source={markdown} />
					</Container>

					<Divider hidden />

					{this.getReactionButtons()}

					<Divider hidden />

					<Container textAlign='right'>
						<Label as='a'>
							<Icon name='bell outline' />
							Subscribe
						</Label>
						<Label as='a'>
							<Icon name='ticket alternate' />
							Reward
						</Label>
						<Label as='a'>
							<Icon name='ban' />
							Hide
						</Label>
						<Label as='a'>
							<Icon name='flag' />
							Report
						</Label>
					</Container>

					<Divider />


					{!!comments.length && !!replyTo && (
						<Message
							floating
							color="yellow"
							onDismiss={()=>{this.props.replyTo(replyTo);}}
							content={`@${comments[replyTo - 1].userId} - ${
								comments[replyTo - 1].content
							}`}
						/>
					)}

					{this.props.auth.isAuth && (
						<SubmitForm
							disabled={this.state.submitting}
							ButtonText={t('reply')}
							onClick={(formData) => {
								const commentData = {
									replyTo: this.props.post.replyTo,
									content: formData,
									postId: this.props.match.params.id,
								};

								this.setState(
									{ submitting: true },
									async () => {
										const response = await this.props.submitComment(
											commentData,
										);

										if (response.type === COMMENT_SUBMITTED) {
											this.props.getComments(
												this.props.match.params.id,
											);
										}

										this.setState({
											submitting: false,
										});
									},
								);
							}}
						/>
					)}

					<CommentSection />
				</Container>
			</React.Fragment>
		);
	}

	render(): Node {
		return (
			<React.Fragment>
				<NavigationBar showBackBtn={true} />
				<Container
					textAlign={'left'}
					style={{ marginTop: '7em', marginBottom: '3em' }}
				>
					<Segment>{this.getContent()}</Segment>
				</Container>
			</React.Fragment>
		);
	}
}

const mapStateToProps = (state) => {
	return {
		auth: state.auth,
		account: state.account,
		post: state.post,
	};
};

const mapDispatchToProps = (dispatch) => {
	return {
		submitComment: (commentData) => dispatch(submitComment(commentData)),
		submitReaction: (reactionData) =>
			dispatch(submitReaction(reactionData)),
		getPost: (id) => dispatch(getPost(id)),
		getReactions: (id) => dispatch(getReactions(id)),
		getComments: (id) => dispatch(getComments(id)),
		replyTo: (level) => dispatch(replyTo(level)),
	};
};

export default withRouter(
	connect(
		mapStateToProps,
		mapDispatchToProps,
	)(Post),
);
