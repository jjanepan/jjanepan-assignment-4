from flask import Flask, request, jsonify, render_template
from sklearn.datasets import fetch_20newsgroups
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.decomposition import TruncatedSVD
from sklearn.metrics.pairwise import cosine_similarity

app = Flask(__name__, static_folder='static', template_folder='templates')


newsgroups_data = fetch_20newsgroups(subset='all')
docs = newsgroups_data.data
tfidf_vectorizer = TfidfVectorizer(stop_words='english')
docs_tfidf = tfidf_vectorizer.fit_transform(docs)
svd_transformer = TruncatedSVD(n_components=100)
docs_transformed = svd_transformer.fit_transform(docs_tfidf)

def calculate_similarities(query):
    query_tfidf = tfidf_vectorizer.transform([query])
    query_transformed = svd_transformer.transform(query_tfidf)
    cos_similarities = cosine_similarity(query_transformed, docs_transformed)
    return cos_similarities

@app.route('/')
def index():
    return render_template('index.html')

@app.route('/search', methods=['POST'])
def search():
    query_text = request.json['query']
    similarities = calculate_similarities(query_text)
    top_doc_indices = similarities.argsort()[0][-5:][::-1]  
    results = [{'doc': docs[index], 'similarity': similarities[0][index]} for index in top_doc_indices]
    return jsonify(results)

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=3000)